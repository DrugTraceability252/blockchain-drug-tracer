import { useKeycloak } from '@react-keycloak/web';

export function useAuth() {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized || !keycloak.authenticated || !keycloak.tokenParsed) {
        return {
            isAuthenticated: false,
            user: null,
            logout: () => {},
        };
    }

    const tokenParsed = keycloak.tokenParsed;

    const groupString = (tokenParsed.group as string) || "";
    const [role, orgId, facilityId, subRole] = groupString.split('/');

    const user = {
        name: tokenParsed.name || tokenParsed.preferred_username,
        email: tokenParsed.email,
        username: tokenParsed.preferred_username,
        
        role: role || "GUEST",
        orgId: orgId || null,
        facilityId: facilityId || null, 
        subRole: subRole || null,
    };

    return {
        isAuthenticated: true,
        user,
        token: keycloak.token,
        logout: () => keycloak.logout(),
    };
}