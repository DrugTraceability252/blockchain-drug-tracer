import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("", "layouts/MainLayout.tsx", [
    index("routes/home.tsx"),
    route("about", "routes/about.tsx"),
    route("manufacturer/dashboard", "routes/manufacturer/dashboard.tsx"),
    route("manufacturer/warehouse/profile", "routes/manufacturer/warehouse/profile/profile.tsx"),
    route("manufacturer/warehouse/profile/create", "routes/manufacturer/warehouse/profile/create.tsx"),
    route("manufacturer/warehouse/batch", "routes/manufacturer/warehouse/batch/batch.tsx"),
    route("manufacturer/warehouse/batch/create", "routes/manufacturer/warehouse/batch/create.tsx"),
    route(
      "manufacturer/warehouse/batch/:id",
      "routes/manufacturer/warehouse/batch/detail.tsx"
    ),
    route("manufacturer/facilities", "routes/manufacturer/facilities.tsx"),
    route("manufacturer/staff", "routes/manufacturer/staff.tsx"),
    route("manufacturer/alerts", "routes/manufacturer/alerts.tsx"),
    route("distributor/dashboard", "routes/distributor/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
