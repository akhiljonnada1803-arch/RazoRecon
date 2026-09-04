'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Sparkles, 
  Heart, 
  Package, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Store, 
  ShieldCheck, 
  LogOut, 
  LogIn,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomerHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function CustomerHeader({ cartCount = 0, onOpenCart }: CustomerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, quickSwitchUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const categories = [
    'All',
    'Electronics',
    'POS Devices',
    'Soundboxes',
    'Enterprise Software',
    'Workstation Peripherals',
    'Accessories'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/customer/products');
      return;
    }
    router.push(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}&category=${encodeURIComponent(selectedCategory)}`);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#072654] text-white text-[11px] px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#0B72E7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
              Razorpay AI Commerce
            </span>
            <span className="hidden sm:inline text-blue-100">
              ⚡ Flash Sale: Get 10% Instant Off on all Smart POS Terminals with code <span className="font-mono font-bold text-amber-300">RAZOR2026</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link 
              href="/merchant/dashboard" 
              className="text-blue-200 hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Portal</span>
            </Link>
            <span className="text-blue-400">•</span>
            <Link 
              href="/hero-demo" 
              className="text-amber-300 hover:text-amber-200 transition-colors font-semibold"
            >
              Live Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Navigation Strip */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0B72E7] to-blue-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#072654] tracking-tight block leading-tight">
                Razor<span className="text-[#0B72E7]">Commerce</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block -mt-0.5">
                AI Powered Store
              </span>
            </div>
          </Link>

          {/* Delivery Location Widget */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer">
            <MapPin className="w-4 h-4 text-[#0B72E7] shrink-0" />
            <div className="text-left text-xs leading-tight">
              <span className="text-[10px] text-slate-400 block">Deliver to</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">Bengaluru 560100</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar with Category Dropdown */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex items-center relative">
          <div className="w-full flex items-center rounded-2xl border-2 border-slate-200 focus-within:border-[#0B72E7] overflow-hidden bg-slate-50/50 transition-all">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-slate-100/80 text-xs font-semibold text-slate-700 border-r border-slate-200 focus:outline-hidden cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search POS hardware, Soundboxes, enterprise software, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 px-3 text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
            />

            <button
              type="submit"
              className="h-10 px-4 bg-[#0B72E7] hover:bg-[#095ec2] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Nav Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* AI Assistant Pill */}
          <Link href="/customer/assistant">
            <button className="h-9 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 text-[#0B72E7] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </Link>

          {/* Wishlist */}
          <Link href="/customer/wishlist" className="hidden sm:flex">
            <div className="p-2 rounded-xl text-slate-600 hover:text-[#0B72E7] hover:bg-slate-100 transition-colors relative" title="Wishlist">
              <Heart className="w-5 h-5" />
            </div>
          </Link>

          {/* Orders */}
          <Link href="/customer/orders" className="hidden sm:flex">
            <div className="p-2 rounded-xl text-slate-600 hover:text-[#0B72E7] hover:bg-slate-100 transition-colors relative" title="My Orders">
              <Package className="w-5 h-5" />
            </div>
          </Link>

          {/* Cart Icon & Badge */}
          <button
            onClick={onOpenCart || (() => router.push('/customer/products'))}
            className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#072654] hover:bg-[#09356d] text-white text-xs font-bold transition-all shadow-2xs relative cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-[#0B72E7] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center -mr-1 shadow-xs animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0B72E7] flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0)}
              </div>
              <div className="hidden md:block text-xs leading-tight">
                <span className="text-[10px] text-slate-400 block">
                  {isAuthenticated ? 'Hello,' : 'Sign in'}
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  {isAuthenticated ? `${displayName} 👋` : 'My Account'}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isAccountDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700"
                onMouseLeave={() => setIsAccountDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 block">{user?.name || 'Guest Shopper'}</span>
                  <span className="text-[11px] text-slate-400 block truncate">{user?.email || 'Browse freely without login'}</span>
                </div>

                <div className="py-1">
                  <Link 
                    href="/customer/orders"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>My Orders & Invoices</span>
                  </Link>

                  <Link 
                    href="/customer/track"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Track Shipment</span>
                  </Link>

                  <Link 
                    href="/customer/wishlist"
                    onClick={() => setIsAccountDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>My Wishlist</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Switch Workspace
                  </div>
                  <button
                    onClick={() => {
                      quickSwitchUser('owner@acme.com');
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-1.5 hover:bg-blue-50 text-slate-700"
                  >
                    <Store className="w-3.5 h-3.5 text-[#0B72E7]" />
                    <span>Merchant Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      quickSwitchUser('admin@platform.com');
                      setIsAccountDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-1.5 hover:bg-indigo-50 text-slate-700"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Platform Admin</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsAccountDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-[#0B72E7] font-semibold"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In / Register</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 overflow-x-auto text-xs py-2 font-medium text-slate-600">
          <Link 
            href="/customer/products" 
            className={`hover:text-[#0B72E7] transition-colors flex items-center gap-1 font-bold ${
              pathname === '/customer/products' ? 'text-[#0B72E7]' : ''
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>

          <Link 
            href="/customer/products?category=Fintech+Hardware" 
            className="hover:text-[#0B72E7] transition-colors whitespace-nowrap"
          >
            Smart POS Terminals
          </Link>

          <Link 
            href="/customer/products?category=Soundboxes" 
            className="hover:text-[#0B72E7] transition-colors whitespace-nowrap"
          >
            4G Audio Soundboxes
          </Link>

          <Link 
            href="/customer/products?category=Enterprise+Software" 
            className="hover:text-[#0B72E7] transition-colors whitespace-nowrap"
          >
            FinOps & ERP Licenses
          </Link>

          <Link 
            href="/customer/products?category=Developer+Hardware" 
            className="hover:text-[#0B72E7] transition-colors whitespace-nowrap"
          >
            Workstations & Peripherals
          </Link>

          <Link 
            href="/customer/products" 
            className="hover:text-amber-600 transition-colors flex items-center gap-1 font-bold text-amber-600 whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Trending Deals</span>
          </Link>

          <div className="ml-auto flex items-center gap-4 text-slate-400 text-[11px]">
            <span>100% Verified Razorpay Merchant Catalog</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-in slide-in-from-top duration-200 text-xs">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-9 px-3 text-xs bg-transparent focus:outline-hidden"
            />
            <button type="submit" className="h-9 px-3 bg-[#0B72E7] text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Links */}
          <div className="space-y-1 font-medium text-slate-700">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50 font-bold text-[#072654]"
            >
              Home
            </Link>
            <Link 
              href="/customer/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Browse All Products
            </Link>
            <Link 
              href="/customer/assistant" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-blue-50 text-[#0B72E7] font-semibold"
            >
              AI Shopping Assistant
            </Link>
            <Link 
              href="/customer/orders" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              My Orders & Invoices
            </Link>
            <Link 
              href="/customer/track" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Track Live Shipment
            </Link>
            <Link 
              href="/merchant/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-900 border-t border-slate-100 pt-2"
            >
              Switch to Merchant Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
