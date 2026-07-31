import type { CategoryTreeNode } from "@/lib/schemas/category";

/**
 * Keeps items with a positive productCount. Fails open: an item with no
 * productCount at all (backend hasn't shipped the field yet) is kept, not
 * filtered — this must be a safe no-op until the backend rollup exists.
 */
export function filterAvailable<T extends { productCount?: number }>(items: T[]): T[] {
    return items.filter((item) => item.productCount === undefined || item.productCount > 0);
}

/**
 * Recursively prunes a category tree, dropping any node (at any depth) whose
 * own productCount is 0 and has no surviving children. Acts as a safety net
 * against backend rollup bugs — if a node's productCount is 0 but it has
 * surviving children, we keep it to avoid silently dropping a live subtree.
 */
export function pruneCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes
        .map((node) => ({
            ...node,
            children: node.children ? pruneCategoryTree(node.children) : undefined,
        }))
        .filter(
            (node) =>
                node.productCount === undefined ||
                node.productCount > 0 ||
                (node.children?.length ?? 0) > 0,
        );
}
