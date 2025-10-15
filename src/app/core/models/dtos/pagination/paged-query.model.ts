export interface PagedQuery {
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search: string;
}
