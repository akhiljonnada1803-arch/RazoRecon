'use client';

import React, { useState } from 'react';
import { DeliveryAddress, Product } from '@/types/commerce';
import { MapPin, CheckCircle, Plus, Edit2, ArrowRight, Building2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdvisorAddressSelectorProps {
  product: Product;
  addresses: DeliveryAddress[];
  onSelectAddress: (address: DeliveryAddress) => void;
}

export function AdvisorAddressSelector({
  product,
  addresses,
  onSelectAddress
}: AdvisorAddressSelectorProps) {
  const [selectedAddrId, setSelectedAddrId] = useState<string>(
    addresses.find(a => a.is_default)?.id || addresses[0]?.id || ''
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newName, setNewName] = useState('');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newState, setNewState] = useState('Karnataka');
  const [newPin, setNewPin] = useState('560100');
  const [newPhone, setNewPhone] = useState('+91 98765 43210');

  const [addressList, setAddressList] = useState<DeliveryAddress[]>(addresses);

  const selectedAddress = addressList.find(a => a.id === selectedAddrId) || addressList[0];

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim()) return;
    const newAddr: DeliveryAddress = {
      id: `addr_custom_${Date.now()}`,
      label: newLabel.trim() || 'Secondary Store Location',
      recipient_name: newName.trim() || 'Store Inventory Lead',
      address_line: newLine.trim(),
      city: newCity,
      state: newState,
      pincode: newPin,
      phone: newPhone,
      is_default: false
    };
    setAddressList(prev => [...prev, newAddr]);
    setSelectedAddrId(newAddr.id);
    setIsAddingNew(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Step 7: Select Delivery Address</h4>
            <p className="text-[11px] text-slate-400">Shipping destination for <strong>{product.name}</strong></p>
          </div>
        </div>
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-bold">
          GST ITC Verified
        </Badge>
      </div>

      {/* Saved Addresses List */}
      <div className="space-y-2.5">
        {addressList.map((addr) => {
          const isSelected = addr.id === selectedAddrId;
          return (
            <div
              key={addr.id}
              onClick={() => setSelectedAddrId(addr.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isSelected
                  ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  isSelected ? 'border-blue-400 bg-blue-500 text-white' : 'border-slate-600 bg-slate-800'
                }`}>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {addr.recipient_name} • {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {addr.phone}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Address Form */}
      {isAddingNew ? (
        <form onSubmit={handleAddNew} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <h5 className="font-bold text-white text-xs">Add New Delivery Location</h5>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Label (e.g. Retail Store #2)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
              required
            />
            <input
              type="text"
              placeholder="Contact Person / Desk"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Street Address, Building, Floor"
            value={newLine}
            onChange={e => setNewLine(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="City"
              value={newCity}
              onChange={e => setNewCity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            />
            <input
              type="text"
              placeholder="State"
              value={newState}
              onChange={e => setNewState(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
            />
            <input
              type="text"
              placeholder="Pincode"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px]"
            >
              Save Address
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full py-2 border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl text-[11px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Store / Warehouse Address</span>
        </button>
      )}

      {/* Confirmation CTA */}
      <div className="pt-2 border-t border-slate-800">
        <Button
          onClick={() => selectedAddress && onSelectAddress(selectedAddress)}
          className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>📍 Ship to {selectedAddress?.label || 'Selected Address'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
