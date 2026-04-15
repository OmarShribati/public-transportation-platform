import { Login } from '@/features/auth/Login';
import { Outlet, RootRoute, Route, Router } from '@tanstack/react-router';
import LoaderLayout from './LoaderLayout';
import Layout from '@/app/Layout';
import { Users } from '@/features/users/Users';


const rootRoute = new RootRoute({
    component: LoaderLayout

});

const layoutRoute = new Route({
    getParentRoute: () => rootRoute,
    id: 'layout',
    component: Layout,
});

const publicRoutes = [
    new Route({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Login,
    }),
];

const protectedWrapper = new Route({
    getParentRoute: () => layoutRoute,
    id: 'protected',
    component: () => (
        <>
            <Outlet />
        </>
    ),

});


export const protectedRoutes = [
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/users',
        component: Users,
    }),
];

const routeTree = rootRoute.addChildren([
    ...publicRoutes,
    layoutRoute.addChildren([
        protectedWrapper.addChildren(protectedRoutes)
    ]),
]);

const router = new Router({
    routeTree,
});

export { router };

