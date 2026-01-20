import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("", "layouts/MainLayout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("manufacturer/dashboard", "routes/manufacturer/dashboard.tsx"),
    route("manufacturer/warehouse/profile", "routes/manufacturer/warehouse/profile.tsx"),
    route("manufacturer/warehouse/batch", "routes/manufacturer/warehouse/batch.tsx"),
    route("manufacturer/facilities", "routes/manufacturer/facilities.tsx"),
    route("manufacturer/staff", "routes/manufacturer/staff.tsx"),
    route("manufacturer/alerts", "routes/manufacturer/alerts.tsx"),
    route("distributor/dashboard", "routes/distributor/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
