import React from 'react';
import AdminLayout from '../../src/views/admin/AdminLayout';
export const metadata = { title: 'Admin Panel | Megadiscountbazar' };
export default function Layout({ children }: { children: React.ReactNode }) { return <AdminLayout>{children}</AdminLayout>; }
