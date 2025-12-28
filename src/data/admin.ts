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
  { name: "Sellers", href: "/admin/sellers" },
  { name: "Content", href: "/admin#content" },
  { name: "Users", href: "/admin#users" },
  { name: "Settings", href: "/admin#settings" },
  { name: "Logout", href: "/admin/login" },
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
