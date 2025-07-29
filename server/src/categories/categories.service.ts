import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) {}

    async create(createCategoryDto: CreateCategoryDto) {
        // Check if slug already exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { slug: createCategoryDto.slug }
        });

        if (existingCategory) {
            throw new ConflictException('Category with this slug already exists');
        }

        // If parentId is provided, verify parent exists
        if (createCategoryDto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: createCategoryDto.parentId }
            });

            if (!parent) {
                throw new NotFoundException('Parent category not found');
            }
        }

        return this.prisma.category.create({
            data: createCategoryDto,
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });
    }

    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        
        return this.prisma.category.findMany({
            where,
            include: {
                parent: true,
                children: {
                    where: includeInactive ? {} : { isActive: true },
                    orderBy: { displayOrder: 'asc' }
                },
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            },
            orderBy: [
                { displayOrder: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    async findAllHierarchical(includeInactive = false) {
        const categories = await this.findAll(includeInactive);
        
        // Filter to get only root categories (no parent)
        const rootCategories = categories.filter(cat => !cat.parentId);
        
        // Build hierarchical structure
        return this.buildCategoryTree(rootCategories, categories);
    }

    private buildCategoryTree(rootCategories: any[], allCategories: any[]): any[] {
        return rootCategories.map(category => ({
            ...category,
            children: this.buildCategoryTree(
                allCategories.filter(cat => cat.parentId === category.id),
                allCategories
            )
        }));
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    orderBy: { displayOrder: 'asc' }
                },
                products: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: {
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' }
                },
                products: {
                    where: { isActive: true }
                },
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });

        if (!category) {
            throw new NotFoundException(`Category with slug ${slug} not found`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Check if slug is being updated and if it conflicts
        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingCategory = await this.prisma.category.findUnique({
                where: { slug: updateCategoryDto.slug }
            });

            if (existingCategory) {
                throw new ConflictException('Category with this slug already exists');
            }
        }

        // If parentId is being updated, verify parent exists and prevent circular reference
        if (updateCategoryDto.parentId) {
            if (updateCategoryDto.parentId === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }

            const parent = await this.prisma.category.findUnique({
                where: { id: updateCategoryDto.parentId }
            });

            if (!parent) {
                throw new NotFoundException('Parent category not found');
            }

            // Check for circular reference
            const isCircular = await this.checkCircularReference(id, updateCategoryDto.parentId);
            if (isCircular) {
                throw new BadRequestException('Circular reference detected');
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });
    }

    async remove(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                products: true
            }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        // Check if category has children
        if (category.children.length > 0) {
            throw new BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
        }

        // Check if category has products
        if (category.products.length > 0) {
            throw new BadRequestException('Cannot delete category with products. Move or delete products first.');
        }

        return this.prisma.category.delete({
            where: { id }
        });
    }

    async toggleStatus(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return this.prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive },
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        products: true,
                        children: true
                    }
                }
            }
        });
    }

    async reorderCategories(categoryOrders: { id: string; displayOrder: number }[]) {
        const updatePromises = categoryOrders.map(({ id, displayOrder }) =>
            this.prisma.category.update({
                where: { id },
                data: { displayOrder }
            })
        );

        await Promise.all(updatePromises);
        return { message: 'Categories reordered successfully' };
    }

    private async checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
        let currentParentId = parentId;
        
        while (currentParentId) {
            if (currentParentId === categoryId) {
                return true;
            }
            
            const parent = await this.prisma.category.findUnique({
                where: { id: currentParentId },
                select: { parentId: true }
            });
            
            currentParentId = parent?.parentId || null;
        }
        
        return false;
    }

    async getCategoryStats() {
        const totalCategories = await this.prisma.category.count();
        const activeCategories = await this.prisma.category.count({
            where: { isActive: true }
        });
        const rootCategories = await this.prisma.category.count({
            where: { parentId: null }
        });
        const subcategories = await this.prisma.category.count({
            where: { parentId: { not: null } }
        });

        return {
            total: totalCategories,
            active: activeCategories,
            inactive: totalCategories - activeCategories,
            root: rootCategories,
            subcategories
        };
    }
}