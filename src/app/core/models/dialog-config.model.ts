export interface DialogConfig<TData = any> {
    id?: number;
    title?: string;
    data?: TData;
    type?: 'success' | 'error' | 'info' | 'warning';
}