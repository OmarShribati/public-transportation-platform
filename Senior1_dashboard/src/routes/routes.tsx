import { Login } from '@/features/auth/Login';
import { Outlet, RootRoute, Route, Router } from '@tanstack/react-router';
import LoaderLayout from './LoaderLayout';
import Layout from '@/app/Layout';
import { Users } from '@/features/users/Users';
import { BusStops } from '@/features/busStops/BusStops';
import {Add as AddBusStops } from '@/features/busStops/Add';
import {Add as AddBusRoutes } from '@/features/busRoutes/Add';
import {edit as EditBusStops } from '@/features/busStops/Edit';
import {Details as DetailsBusRoutes } from '@/features/busRoutes/Details';
import {Details as DetailsDrivers } from '@/features/users/drivers/Details';
import {Details as DetailsVehicles } from '@/features/vehicles/Details';
import { BusRoutes } from '@/features/busRoutes/BusRoutes';
import { Vehicles } from '@/features/vehicles/Vehicles';
import { Drivers } from '@/features/users/drivers/Drivers';
import { Notification } from '@/features/notification/Notification';
import { Complaints } from '@/features/complaints/Complaints';
import { Dashboard } from '@/features/dashboard/Dashboard';


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
        path: '/drivers/requests',
        component: Drivers,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/drivers/$id',
        parseParams: ({ id }) => ({ id }),
        stringifyParams: ({ id }) => ({ id }),
        component: DetailsDrivers,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/users',
        component: Users,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/send/notification',
        component: Notification,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/stops',
        component: BusStops,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/stops/add',
        component: AddBusStops,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/stops/edit/$id',
        parseParams: ({ id }) => ({ id }),
        stringifyParams: ({ id }) => ({ id }),
        component: EditBusStops,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/vehicles',
        component: Vehicles,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/vehicles/$id',
        parseParams: ({ id }) => ({ id }),
        stringifyParams: ({ id }) => ({ id }),
        component: DetailsVehicles,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/routes',
        component: BusRoutes,
    }),
      new Route({
        getParentRoute: () => protectedWrapper,
        path: '/routes/add',
        component: AddBusRoutes,
    }),
    new Route({
        getParentRoute: () => protectedWrapper,
        path: '/routes/$id',
        parseParams: ({ id }) => ({ id }),
        stringifyParams: ({ id }) => ({ id }),
        component: DetailsBusRoutes,
    }),
    new Route({
      getParentRoute: () => protectedWrapper,
      path: '/complaints',
      component: Complaints,
  }),
    new Route({
      getParentRoute: () => protectedWrapper,
      path: '/dashboard',
      component: Dashboard,
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

