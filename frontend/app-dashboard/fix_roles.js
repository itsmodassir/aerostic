const fs = require('fs');
const path = require('path');

function replaceRoleWithGlobalRole(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
                replaceRoleWithGlobalRole(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Target specifically the instances that were previously globalRole
            // We want to be careful not to overwrite legitimate "role" properties like on memberships or tenants

            // 1. useAuth.ts and RoleGuard.tsx and layout.tsx
            if (fullPath.includes('useAuth.ts') || fullPath.includes('RoleGuard.tsx') || fullPath.includes('app/admin/layout.tsx')) {
                if (content.includes("role: 'super_admin'")) {
                    content = content.replace(/role: 'super_admin'/g, "globalRole: 'super_admin'");
                    modified = true;
                }
                if (content.includes("user?.role")) {
                    content = content.replace(/user\?.role/g, "user?.globalRole");
                    modified = true;
                }
                if (content.includes("user.role")) {
                    content = content.replace(/user\.role/g, "user.globalRole");
                    modified = true;
                }
            }

            // 2. profile/page.tsx
            if (fullPath.includes('profile/page.tsx')) {
                if (content.includes("user.role ===")) {
                    content = content.replace(/user\.role ===/g, "user.globalRole ===");
                    modified = true;
                }
            }

            // 3. inbox/page.tsx
            if (fullPath.includes('inbox/page.tsx') || fullPath.includes('[workspaceId]/page.tsx') || fullPath.includes('(admin)/admin/page.tsx')) {
                if (content.includes("user.role ===") || content.includes("user?.role ===")) {
                    content = content.replace(/user\.role ===/g, "user.globalRole ===").replace(/user\?.role ===/g, "user?.globalRole ===");
                    modified = true;
                }
            }

            // 4. usePermissions.ts
            if (fullPath.includes('usePermissions.ts')) {
                if (content.includes("user?.role")) {
                    content = content.replace(/user\?.role/g, "user?.globalRole");
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Reverted: ${fullPath}`);
            }
        }
    });
}

replaceRoleWithGlobalRole(__dirname);
console.log('Complete');
