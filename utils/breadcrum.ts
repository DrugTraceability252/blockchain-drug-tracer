export function buildBreadcrumb(pathname: string, menu: any[]) {
    const result: { title: string }[] = [];

    for (const item of menu) {
        if (item.path === pathname) {
            result.push({ title: item.label });
            return result;
        }

        if (item.children) {
            const child = item.children.find(
            (c: any) => c.path === pathname
            );

            if (child) {
                result.push({ title: item.label });
                result.push({ title: child.label });
                return result;
            }
        }
    }

    return result;
}
