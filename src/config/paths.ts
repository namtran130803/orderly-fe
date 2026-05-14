const auth = '/auth'
const expenses = '/expenses'
const overview = '/overview'
const settings = '/settings'
const stores = '/stores'
const menu = '/menu'
const areas = '/areas'
const statuses = '/statuses'
const orders = '/orders'

export const paths = {
    auth: {
        login: `${auth}/login`,
        register: `${auth}/register`
    },
    overview: {
        index: overview
    },
    expenses: {
        index: `${expenses}`,
        create: `${expenses}/create`,
        edit: (id: string | number) => `${expenses}/${id}/edit`
    },
    settings: {
        index: settings
    },
    stores: {
        index: stores,
        create: `${stores}/create`,
        edit: (id: string | number) => `${stores}/${id}/edit`
    },
    menu: {
        index: menu,
        categories: {
            create: `${menu}/categories/create`,
            edit: (id: string | number) => `${menu}/categories/${id}/edit`,
            reorder: `${menu}/categories/reorder`
        },
        items: {
            create: `${menu}/items/create`,
            edit: (id: string | number) => `${menu}/items/${id}/edit`,
        }
    },
    areas: {
        index: areas,
        create: `${areas}/create`,
        edit: (id: string | number) => `${areas}/${id}/edit`,
        reorder: `${areas}/reorder`,
        tables: {
            edit: (id: string | number) => `${areas}/tables/${id}/edit`,
        }
    },
    statuses: {
        index: statuses,
        create: `${statuses}/create`,
        edit: (id: string | number) => `${statuses}/${id}/edit`,
        reorder: `${statuses}/reorder`
    },
    orders: {
        index: orders,
        selectTable: `${orders}/select-table`,
        selectMenu: `${orders}/select-menu`,
        summary: `${orders}/summary`
    }
}