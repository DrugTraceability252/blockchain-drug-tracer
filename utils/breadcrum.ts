function matchPath(pattern: string | undefined, pathname: string) {
    if (!pattern) return null;

    const keys: string[] = [];

    const regexPattern = pattern.replace(/:([^/]+)/g, (_, key) => {
        keys.push(key);
        return "([^/]+)";
    });

    const regex = new RegExp("^" + regexPattern + "$");
    const match = pathname.match(regex);

    if (!match) return null;

    const params: Record<string, string> = {};
    keys.forEach((k, i) => {
        params[k] = match[i + 1];
    });

    return params;
}

export function buildBreadcrumb(pathname: string, menu: any[]) {
    const result: { title: string }[] = [];

    for (const item of menu) {
        const params = item.path ? matchPath(item.path, pathname) : null;

        if (params) {
            result.push({
                title: params.id ?? item.label
            });
            return result;
        }

        if (item.children) {
            const child = item.children.find((c: any) =>
                c.path && matchPath(c.path, pathname)
            );

            if (child) {
                const params = matchPath(child.path, pathname);

                result.push({ title: item.label });
                result.push({
                    title: params?.id ?? child.label
                });

                return result;
            }

            for (const childItem of item.children) {
                if (childItem.children) {
                    const subChild = childItem.children.find((c: any) =>
                        c.path && matchPath(c.path, pathname)
                    );

                    if (subChild) {
                        const params = matchPath(subChild.path, pathname);

                        result.push({ title: item.label });
                        result.push({ title: childItem.label });
                        result.push({
                            title: params?.id ?? subChild.label
                        });

                        return result;
                    }
                }
            }
        }
    }

    return result;
}