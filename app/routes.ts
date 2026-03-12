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
    route("manufacturer/staff", "routes/manufacturer/staff/staff.tsx"),
    route("manufacturer/staff/create", "routes/manufacturer/staff/create.tsx"),
    route("manufacturer/staff/register", "routes/manufacturer/staff/register.tsx"),
    route("manufacturer/alerts", "routes/manufacturer/alerts.tsx"),


    route("distributor/dashboard", "routes/distributor/dashboard.tsx"),
    route("distributor/distribute", "routes/distributor/distribute/distribute.tsx"),
    route("distributor/staff", "routes/distributor/staff/staff.tsx"),
    route("distributor/staff/create", "routes/distributor/staff/create.tsx"),
    route("distributor/staff/register", "routes/distributor/staff/register.tsx"),
    route("distributor/distribute/:id", "routes/distributor/distribute/detail.tsx"),

    route("regulator/company", "routes/regulator/company.tsx"),
    route("regulator/warehouse/batch", "routes/regulator/warehouse/batch/batch.tsx"),
    route("regulator/warehouse/profile", "routes/regulator/warehouse/profile/profile.tsx"),
    route("regulator/warehouse/profile/create", "routes/regulator/warehouse/profile/create.tsx"),
    route("regulator/warehouse/batch/create", "routes/regulator/warehouse/batch/create.tsx"),
    route("regulator/warehouse/batch/:id", "routes/regulator/warehouse/batch/detail.tsx"),
    route("regulator/staff", "routes/regulator/staff/staff.tsx"),
    route("regulator/staff/create", "routes/regulator/staff/create.tsx"),
    route("regulator/staff/register", "routes/regulator/staff/register.tsx"),
  ]),
] satisfies RouteConfig;
