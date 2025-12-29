export const adminNav = [
  { key: "overview", label: "Overview" },
  { key: "content", label: "Content" },
  { key: "gallery", label: "Gallery" },
  { key: "users", label: "Users" },
  { key: "settings", label: "Settings" },
];

export const adminNavLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Gallery", href: "/admin/gallery" },
  { name: "Brands", href: "/admin/brands" },
  { name: "Founders", href: "/admin/founders" },
  { name: "Co-Founders", href: "/admin/cofounders" },
  { name: "Team", href: "/admin/teams" },
  { name: "Buyers", href: "/admin/buyers" },
  { name: "Sellers", href: "/admin/sellers" },
  { name: "About", href: "/admin/about" },
  { name: "Contact", href: "/admin/contact" },
  { name: "Cookies", href: "/admin/cookies" },
  { name: "Feedback", href: "/admin/feedback" },
  { name: "Gallery Detail", href: "/admin/gallery-detail" },
  { name: "Not Found", href: "/admin/not-found" },
  { name: "Partner", href: "/admin/partner" },
  { name: "Privacy", href: "/admin/privacy" },
  { name: "Sponsor", href: "/admin/sponsor" },
  { name: "Terms", href: "/admin/terms" },
  { name: "Testimonials", href: "/admin/testimonials" },
  { name: "Form Builder", href: "/admin/forms" },
  { name: "Submit Success", href: "/admin/submit-success" },
  { name: "Platform Branding", href: "/admin/platform-branding" },
  { name: "Leads", href: "/admin/leads" },
  { name: "Profile", href: "/admin/profile" },
  { name: "Templates", href: "/admin/templates" },
  { name: "Notifications", href: "/admin/notifications" },
  { name: "Users", href: "/admin/users" },
  { name: "Theme", href: "/admin/theme" },
  { name: "Profile Config", href: "/admin/profile-config" },
  { name: "Editors", href: "/admin/editors" },
  { name: "Brand Highlights", href: "/admin/brand-editor" },
  { name: "Celebrities", href: "/admin/celebrities" },
  { name: "Buyer Editor", href: "/admin/buyer-editor" },
  { name: "Seller Editor", href: "/admin/seller-editor" },
  { name: "Timeline", href: "/admin/timeline" },
  { name: "Arches Editor", href: "/admin/arches" },
  { name: "Stalls Editor", href: "/admin/stalls" },
  { name: "Buyer Mosaic", href: "/admin/buyer-mosaic" },
  { name: "VVIP Editor", href: "/admin/vvips" },
  { name: "Founders Editor", href: "/admin/founder-editor" },
  { name: "Co-founders Editor", href: "/admin/cofounder-editor" },
  { name: "Counts", href: "/admin/counts" },
  { name: "Dual CTA", href: "/admin/dual-cta" },
  { name: "Content", href: "/admin#content" },
  { name: "Users", href: "/admin#users" },
  { name: "Settings", href: "/admin#settings" },
  { name: "Logout", href: "/admin/login" },
];

export const adminNavGroups = [
  { label: "Overview", items: [{ name: "Dashboard", href: "/admin" }] },
  {
    label: "Experiences",
    items: [
      { name: "Gallery", href: "/admin/gallery" },
      { name: "Gallery Detail", href: "/admin/gallery-detail" },
      { name: "Brands", href: "/admin/brands" },
      { name: "Testimonials", href: "/admin/testimonials" },
    ],
  },
  {
    label: "Pages",
    items: [
      { name: "About", href: "/admin/about" },
      { name: "Contact", href: "/admin/contact" },
      { name: "Not Found", href: "/admin/not-found" },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Team", href: "/admin/teams" },
      { name: "Founders", href: "/admin/founders" },
      { name: "Co-Founders", href: "/admin/cofounders" },
    ],
  },
  {
    label: "Growth",
    items: [
      { name: "Buyers", href: "/admin/buyers" },
      { name: "Sellers", href: "/admin/sellers" },
      { name: "Partner", href: "/admin/partner" },
      { name: "Sponsor", href: "/admin/sponsor" },
    ],
  },
  {
    label: "Governance",
    items: [
      { name: "Platform Branding", href: "/admin/platform-branding" },
      { name: "Privacy", href: "/admin/privacy" },
      { name: "Cookies", href: "/admin/cookies" },
      { name: "Terms", href: "/admin/terms" },
      { name: "Submit Success", href: "/admin/submit-success" },
    ],
  },
  { label: "Forms", items: [{ name: "Form Builder", href: "/admin/forms" }] },
  { label: "Leads", items: [{ name: "Leads", href: "/admin/leads" }] },
  {
    label: "Templates",
    items: [
      { name: "Templates", href: "/admin/templates" },
      { name: "Notifications", href: "/admin/notifications" },
      { name: "Profile Config", href: "/admin/profile-config" },
    ],
  },
  { label: "Users", items: [{ name: "Users", href: "/admin/users" }] },
  { label: "Appearance", items: [{ name: "Theme", href: "/admin/theme" }] },
  {
    label: "Home Editors",
    items: [
      { name: "Editors", href: "/admin/editors" },
      { name: "Brand Highlights", href: "/admin/brand-editor" },
      { name: "Celebrities", href: "/admin/celebrities" },
      { name: "Buyer Editor", href: "/admin/buyer-editor" },
      { name: "Seller Editor", href: "/admin/seller-editor" },
      { name: "Timeline", href: "/admin/timeline" },
      { name: "Arches Editor", href: "/admin/arches" },
      { name: "Stalls Editor", href: "/admin/stalls" },
      { name: "Buyer Mosaic", href: "/admin/buyer-mosaic" },
      { name: "VVIP Editor", href: "/admin/vvips" },
      { name: "Founders Editor", href: "/admin/founder-editor" },
      { name: "Co-founders Editor", href: "/admin/cofounder-editor" },
      { name: "Counts", href: "/admin/counts" },
      { name: "Dual CTA", href: "/admin/dual-cta" },
    ],
  },
  { label: "Profile", items: [{ name: "Profile", href: "/admin/profile" }] },
  { label: "Session", items: [{ name: "Logout", href: "/admin/login" }] },
];

export const adminStats = [
  { label: "Published sections", value: 16, delta: "+2 this week" },
  { label: "Drafts", value: 4, delta: "2 ready to review" },
  { label: "Gallery in review", value: 48, delta: "+12 today" },
  { label: "Testimonials", value: 68, delta: "+5 new" },
];

export const adminSections = [
  { name: "Hero", status: "Live", updated: "Today", owner: "Aishwarya", notes: "Synced with New Home" },
  { name: "Seller Voices", status: "Staged", updated: "Yesterday", owner: "Priyanshi", notes: "Pending QA" },
  { name: "Co-Founders", status: "Live", updated: "2d ago", owner: "Sanjay", notes: "Copy locked" },
  { name: "Gallery Highlights", status: "Draft", updated: "3d ago", owner: "Rohit", notes: "Needs assets" },
];

export const adminTasks = [
  { title: "Approve seller testimonials", tag: "Content", status: "Pending" },
  { title: "Review 48 gallery uploads", tag: "Gallery", status: "In review" },
  { title: "Sync VVIP highlights", tag: "Homepage", status: "In progress" },
  { title: "Cache warm metrics", tag: "Ops", status: "Scheduled" },
];

export const adminGalleryQueue = [
  { id: "GL-1021", title: "Immersive VR lane", owner: "Rohit", status: "In review" },
  { id: "GL-1022", title: "Entrance arches — Goa", owner: "Aishwarya", status: "Awaiting assets" },
  { id: "GL-1023", title: "Seller lanes — Pune", owner: "Sanjay", status: "Ready to publish" },
];

export const adminUsers = [
  { name: "Aishwarya", role: "Admin", lastActive: "Today" },
  { name: "Vijay", role: "Editor", lastActive: "2h ago" },
  { name: "Priyanshi", role: "Editor", lastActive: "Today" },
  { name: "Rohit", role: "Reviewer", lastActive: "Yesterday" },
  { name: "Sanjay", role: "Admin", lastActive: "Today" },
];
