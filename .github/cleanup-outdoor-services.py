from pathlib import Path
import re
import shutil

ROOT = Path.cwd()


def replace_text(path: Path, replacements: list[tuple[str, str]]) -> None:
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in replacements:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")


# Move the active division to its permanent module name.
old_division = ROOT / "src/divisions/landscaping"
new_division = ROOT / "src/divisions/outdoor-services"
if old_division.exists():
    if new_division.exists():
        shutil.rmtree(new_division)
    shutil.move(str(old_division), str(new_division))

# Remove obsolete duplicate components superseded by the active layout/auth modules.
for relative in (
    "LandscapingLayout.tsx",
    "LandscapingLogin.tsx",
    "LandscapingModulePage.tsx",
):
    target = new_division / relative
    if target.exists():
        target.unlink()

# Rename active component files.
component_moves = {
    "Landscaping.tsx": "OutdoorServices.tsx",
    "layout/LandscapingFooter.tsx": "layout/OutdoorServicesFooter.tsx",
    "layout/LandscapingHeader.tsx": "layout/OutdoorServicesHeader.tsx",
    "layout/LandscapingLayout.tsx": "layout/OutdoorServicesLayout.tsx",
    "layout/LandscapingNavigation.tsx": "layout/OutdoorServicesNavigation.tsx",
}
for source_name, target_name in component_moves.items():
    source = new_division / source_name
    target = new_division / target_name
    if source.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        source.rename(target)

# Rename the frontend division API module.
old_api = ROOT / "src/services/api/landscaping.ts"
new_api = ROOT / "src/services/api/outdoorServices.ts"
if old_api.exists():
    old_api.rename(new_api)

# Rename styling files and later rename their selectors/variables as well.
style_moves = {
    "landscaping.css": "outdoor-services.css",
    "landscaping-auth.css": "outdoor-services-auth.css",
    "landscaping-pages.css": "outdoor-services-pages.css",
    "landscaping-account.css": "outdoor-services-account.css",
    "landscaping-customer-pages.css": "outdoor-services-customer-pages.css",
}
styles_dir = ROOT / "src/styles"
for source_name, target_name in style_moves.items():
    source = styles_dir / source_name
    target = styles_dir / target_name
    if source.exists():
        source.rename(target)

# Rewrite the central route namespace and type before the general business-slug pass.
routes_file = ROOT / "src/shared/constants/routes.ts"
replace_text(
    routes_file,
    [
        ("    landscaping: {", "    outdoorServices: {"),
        ("ROUTES.divisions.landscaping", "ROUTES.divisions.outdoorServices"),
        ("LandscapingRoute", "OutdoorServicesRoute"),
    ],
)

# Rewrite route/module/API/style references across frontend source.
for path in (ROOT / "src").rglob("*"):
    if path.suffix not in {".ts", ".tsx", ".css"}:
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    text = text.replace("ROUTES.divisions.landscaping", "ROUTES.divisions.outdoorServices")
    text = text.replace("./divisions/landscaping", "./divisions/outdoor-services")
    text = text.replace("landscapingRoutes", "outdoorServicesRoutes")
    text = text.replace("landscapingApi", "outdoorServicesApi")
    text = text.replace("services/api/landscaping", "services/api/outdoorServices")
    text = text.replace('from "./landscaping"', 'from "./outdoorServices"')
    text = text.replace("styles/landscaping", "styles/outdoor-services")
    text = text.replace("LandscapingRoute", "OutdoorServicesRoute")
    text = text.replace("landscaping-", "outdoor-services-")
    if text != original:
        path.write_text(text, encoding="utf-8")

# Use the permanent business slug wherever business IDs are stored, filtered, or selected.
business_identifier_files: list[Path] = [ROOT / "src/services/api/forms.ts"]
for base in (ROOT / "src/admin", ROOT / "src/shared"):
    business_identifier_files.extend(
        path for path in base.rglob("*") if path.suffix in {".ts", ".tsx"}
    )

for path in business_identifier_files:
    if not path.exists() or path == routes_file:
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    text = text.replace('"landscaping"', '"outdoor-services"')
    text = text.replace("'landscaping'", "'outdoor-services'")
    text = text.replace(
        "(landscaping|transport|productions)",
        "(outdoor-services|transport|productions)",
    )
    text = re.sub(r"(?m)^(\s*)landscaping:", r'\1"outdoor-services":', text)
    text = text.replace(
        'value="outdoor-services">Landscaping</option>',
        'value="outdoor-services">Outdoor Services</option>',
    )
    if text != original:
        path.write_text(text, encoding="utf-8")

# Business registry identifiers and image path.
replace_text(
    ROOT / "src/shared/constants/businesses.ts",
    [
        ('id: "pioneer-landscaping"', 'id: "pioneer-outdoor-services"'),
        (
            'logoPath: "/images/businesses/landscaping-logo.svg"',
            'logoPath: "/images/businesses/outdoor-services-logo.svg"',
        ),
    ],
)

# Debug navigation must not retain the retired URL.
replace_text(
    ROOT / "src/shared/components/DebugToolbar.tsx",
    [
        ('label: "Landscaping"', 'label: "Outdoor Services"'),
        ('path: "/landscaping"', 'path: "/outdoor-services"'),
    ],
)

# Business dropdown labels should match the permanent name.
for relative in (
    "src/admin/components/DashboardWidgetSettings.tsx",
    "src/admin/components/JobFilters.tsx",
    "src/admin/components/HistoryFilters.tsx",
    "src/admin/components/ContactForm.tsx",
    "src/admin/components/EstimateForm.tsx",
):
    replace_text(
        ROOT / relative,
        [('>Landscaping</option>', '>Outdoor Services</option>')],
    )

# Rename active division component identifiers and accessibility labels.
for path in new_division.rglob("*.tsx"):
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in (
        ("LandscapingNavigation", "OutdoorServicesNavigation"),
        ("LandscapingFooter", "OutdoorServicesFooter"),
        ("LandscapingHeader", "OutdoorServicesHeader"),
        ("LandscapingLayout", "OutdoorServicesLayout"),
    ):
        text = text.replace(old, new)
    text = text.replace("function Landscaping()", "function OutdoorServices()")
    text = text.replace("export default Landscaping;", "export default OutdoorServices;")
    text = text.replace(
        'import Landscaping from "./Landscaping";',
        'import OutdoorServices from "./OutdoorServices";',
    )
    text = text.replace("<Landscaping />", "<OutdoorServices />")
    text = text.replace(
        'aria-label="Landscaping navigation"',
        'aria-label="Outdoor services navigation"',
    )
    text = text.replace(
        "The landscaping team can now review it",
        "The Pioneer Outdoor Services team can now review it",
    )
    if text != original:
        path.write_text(text, encoding="utf-8")

# Replace the routes module so /landscaping is no longer registered as an alias.
route_lines = [
    'import type { RouteObject } from "react-router-dom";',
    "",
    'import OutdoorServices from "./OutdoorServices";',
    'import ForgotPassword from "./auth/ForgotPassword";',
    'import Login from "./auth/Login";',
    'import Register from "./auth/Register";',
    'import ResetPassword from "./auth/ResetPassword";',
    'import VerifyEmail from "./auth/VerifyEmail";',
    'import OutdoorServicesLayout from "./layout/OutdoorServicesLayout";',
    'import Contact from "./pages/Contact";',
    'import CustomerAccount from "./pages/CustomerAccount";',
    'import Gallery from "./pages/Gallery";',
    'import QuoteRequest from "./pages/QuoteRequest";',
    'import ServiceRequest from "./pages/ServiceRequest";',
    'import Services from "./pages/Services";',
    'import { ROUTES } from "../../shared/constants/routes";',
    "",
    "export const outdoorServicesRoutes: RouteObject[] = [",
    "  {",
    "    path: ROUTES.divisions.outdoorServices.root,",
    "    element: <OutdoorServicesLayout />,",
    "    children: [",
    "      { index: true, element: <OutdoorServices /> },",
    '      { path: "services", element: <Services /> },',
    '      { path: "gallery", element: <Gallery /> },',
    '      { path: "quote", element: <QuoteRequest /> },',
    '      { path: "request", element: <ServiceRequest /> },',
    '      { path: "contact", element: <Contact /> },',
    '      { path: "login", element: <Login /> },',
    '      { path: "register", element: <Register /> },',
    '      { path: "forgot-password", element: <ForgotPassword /> },',
    '      { path: "reset-password", element: <ResetPassword /> },',
    '      { path: "verify-email", element: <VerifyEmail /> },',
    '      { path: "account", element: <CustomerAccount /> }',
    "    ]",
    "  }",
    "];",
]
(new_division / "routes.tsx").write_text("\n".join(route_lines) + "\n", encoding="utf-8")
(new_division / "index.ts").write_text(
    'export { outdoorServicesRoutes } from "./routes";\n',
    encoding="utf-8",
)

# Public metadata and project documentation should not advertise the retired company name.
replace_text(
    ROOT / "index.html",
    [
        ("Pioneer Pressure Washing and Landscaping", "Pioneer Outdoor Services"),
        ("Pioneer Pressure Washing & Landscaping", "Pioneer Outdoor Services"),
    ],
)
for relative in ("README.md", "ROADMAP.md"):
    replace_text(
        ROOT / relative,
        [
            ("Pioneer Pressure Washing & Landscaping", "Pioneer Outdoor Services"),
            ("Pioneer Landscaping Services", "Pioneer Outdoor Services"),
            ("Pioneer Landscaping", "Pioneer Outdoor Services"),
            ("src/divisions/landscaping", "src/divisions/outdoor-services"),
            ("└── landscaping/", "└── outdoor-services/"),
            ("the landscaping team", "the Pioneer Outdoor Services team"),
            ("landscaping team", "Pioneer Outdoor Services team"),
            ("landscaping division", "Outdoor Services division"),
        ],
    )

# Backend validation and tests use the same permanent business slug.
for base in (ROOT / "server/src", ROOT / "server/tests"):
    if not base.exists():
        continue
    for path in base.rglob("*"):
        if path.suffix not in {".ts", ".tsx", ".js"}:
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        text = text.replace('"landscaping"', '"outdoor-services"')
        text = text.replace("'landscaping'", "'outdoor-services'")
        if text != original:
            path.write_text(text, encoding="utf-8")

# Migrate existing persisted identifiers without rewriting historical migrations.
migration = (
    ROOT
    / "server/prisma/migrations/20260908183000_rename_outdoor_services_identifiers/migration.sql"
)
migration.parent.mkdir(parents=True, exist_ok=True)
migration.write_text(
    "\n".join(
        [
            "-- Rename persisted business identifiers after the Pioneer Outdoor Services rebrand.",
            'UPDATE "Expense"',
            "SET \"business\" = 'outdoor-services'",
            "WHERE \"business\" = 'landscaping';",
            "",
            'UPDATE "FormFile"',
            "SET \"businessScope\" = 'outdoor-services'",
            "WHERE \"businessScope\" = 'landscaping';",
            "",
            'UPDATE "Setting"',
            "SET \"scope\" = 'outdoor-services'",
            "WHERE \"scope\" = 'landscaping';",
            "",
        ]
    ),
    encoding="utf-8",
)

# Final direct audit. Historical migration files are immutable and intentionally retain old values.
forbidden: list[str] = []
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if ".git" in path.parts or "node_modules" in path.parts:
        continue
    relative = path.relative_to(ROOT).as_posix()
    if relative.startswith("server/prisma/migrations/"):
        continue
    if path.suffix.lower() not in {
        ".ts",
        ".tsx",
        ".css",
        ".html",
        ".md",
        ".json",
        ".yml",
        ".yaml",
    }:
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for needle in (
        '"/landscaping',
        "'/landscaping",
        "ROUTES.divisions.landscaping",
        "src/divisions/landscaping",
        "services/api/landscaping",
        "styles/landscaping",
        '"pioneer-landscaping"',
        'slug: "landscaping"',
        "landscapingRoutes",
        "landscapingApi",
        "landscaping-",
    ):
        if needle in text:
            forbidden.append(f"{relative}: {needle}")

for path in (ROOT / "src").rglob("*"):
    relative = path.relative_to(ROOT).as_posix()
    if path.is_dir() and path.name == "landscaping":
        forbidden.append(f"legacy directory: {relative}")
    if path.is_file() and path.name.startswith("landscaping"):
        forbidden.append(f"legacy filename: {relative}")

if forbidden:
    raise SystemExit("Legacy identifiers remain:\n" + "\n".join(sorted(set(forbidden))))
