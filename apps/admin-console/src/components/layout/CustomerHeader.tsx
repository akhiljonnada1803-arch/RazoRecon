'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Heart, 
  Package, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut, 
  LogIn,
  Store,
  Tag,
  SlidersHorizontal,
  Flame,
  ShieldCheck
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
  const { user, isAuthenticated, isCustomer, logout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/customer/products');
      return;
    }
    router.push(`/customer/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
      {/* Top Marketplace Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0B72E7] via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20 text-white" />
            </div>
            <div>
              <span className="font-black text-xl text-[#072654] tracking-tight block leading-none">
                Razor<span className="text-[#0B72E7]">Commerce</span> <span className="text-xs font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 ml-0.5">AI</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block mt-0.5">
                AI Powered Marketplace
              </span>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link 
              href="/" 
              className={`transition-colors hover:text-[#0B72E7] ${
                pathname === '/' ? 'text-[#0B72E7] font-bold' : ''
              }`}
            >
              Home
            </Link>

            <Link 
              href="/customer/products" 
              className={`transition-colors hover:text-[#0B72E7] flex items-center gap-1 ${
                pathname === '/customer/products' ? 'text-[#0B72E7] font-bold' : ''
              }`}
            >
              Categories
            </Link>

            <Link 
              href="/customer/products?deals=true" 
              className="transition-colors hover:text-amber-600 text-slate-700 flex items-center gap-1 font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Deals</span>
            </Link>

            <Link 
              href="/customer/assistant" 
              className={`transition-colors hover:text-[#0B72E7] flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 text-[#0B72E7] font-bold border border-blue-200/80 shadow-2xs hover:bg-blue-100 ${
                pathname.startsWith('/customer/assistant') ? 'bg-[#0B72E7] text-white border-transparent' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Shopping</span>
            </Link>

            <Link 
              href="/login" 
              className="transition-colors hover:text-slate-900 text-slate-500 flex items-center gap-1 font-medium"
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Become a Merchant</span>
            </Link>
          </nav>

          {/* 3. Right Side: Auth / Account + Cart Icon */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cart Button */}
            <button
              onClick={onOpenCart || (() => router.push('/customer/products'))}
              className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all relative cursor-pointer border border-slate-200/70 shadow-2xs group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#072654] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 ? (
                <span className="bg-[#0B72E7] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                  {cartCount}
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  0
                </span>
              )}
            </button>

            {/* If Not Authenticated (Guest User): Show Login + Sign Up */}
            {!isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-9 px-3.5 font-bold text-slate-700 hover:text-[#0B72E7] hover:bg-blue-50 rounded-xl"
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/login">
                  <Button 
                    size="sm" 
                    className="text-xs h-9 px-4 font-bold bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl shadow-xs"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              /* If Authenticated: Clean Customer Account Menu */
              <div className="relative">
                <button
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all text-left bg-slate-50/50 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-xs leading-tight">
                    <span className="text-[10px] text-slate-400 block font-medium">Hello,</span>
                    <span className="font-bold text-[#072654] flex items-center gap-1">
                      {displayName} 👋
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </button>

                {isAccountDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-700"
                    onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-[#072654] block">{user?.name}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{user?.email}</span>
                    </div>

                    <div className="py-1 font-medium">
                      <Link 
                        href="/customer/orders"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link 
                        href="/customer/wishlist"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </Link>

                      <Link 
                        href="/customer/assistant"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-[#0B72E7] font-semibold"
                      >
                        <Sparkles className="w-4 h-4 text-[#0B72E7]" />
                        <span>AI Assistant</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsAccountDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-in slide-in-from-top duration-150 text-xs shadow-lg">
          <form onSubmit={handleSearch} className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <input
              type="text"
              placeholder="Search products, brands, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 px-3 text-xs bg-transparent focus:outline-hidden"
            />
            <button type="submit" className="h-10 px-3.5 bg-[#0B72E7] text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-1 font-semibold text-slate-700">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-[#072654]"
            >
              Home
            </Link>
            <Link 
              href="/customer/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50"
            >
              Categories & Catalog
            </Link>
            <Link 
              href="/customer/products?deals=true" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-600 font-bold"
            >
              🔥 Deals & Flash Sale
            </Link>
            <Link 
              href="/customer/assistant" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-blue-50 text-[#0B72E7] font-bold"
            >
              ✨ AI Shopping Assistant
            </Link>
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-500 border-t border-slate-100 pt-2"
            >
              Become a Merchant
            </Link>

            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl">
                    Login
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full text-xs font-bold bg-[#0B72E7] text-white rounded-xl">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
