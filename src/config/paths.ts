const auth = ''
const expenses = '/expenses'
const overview = '/overview'
const settings = '/settings'
const stores = '/stores'
const menu = '/menu'
const areas = '/areas'
const statuses = '/statuses'
const orders = '/orders'
const attendance = '/attendance'
const schedule = '/schedule'
const leave = '/leave'
const payroll = '/payroll'

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
        index: settings,
        hrGuide: `${settings}/hr-guide`,
    },
    employees: {
        index: '/employees',
        create: '/employees/create',
        edit: (id: string | number) => `/employees/${id}/edit`,
    },
    roles: {
        index: '/roles',
        create: '/roles/create',
        edit: (id: string | number) => `/roles/${id}/edit`
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
    },
    attendance: {
        index: attendance,
        kiosk: `${attendance}/kiosk`,
        scan: `${attendance}/scan`,
        employee: (id: string | number) => `${attendance}/employees/${id}`,
        editRecord: (id: string | number) => `${attendance}/records/${id}/edit`,
        createRecord: `${attendance}/records/create`,
    },
    schedule: {
        index: schedule,
        overrideCreate: `${schedule}/overrides/create`,
    },
    leave: {
        index: leave,
        detail: (id: string | number) => `${leave}/${id}`,
        request: `${leave}/request`,
    },
    payroll: {
        index: payroll,
        employeeDetail: (id: string | number) => `${payroll}/employees/${id}`,
    },
}