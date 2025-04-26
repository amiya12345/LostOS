// app/components/Sidebar.jsx
'use client'
import React from 'react';
import { FaWallet, FaChartLine, FaMusic, FaTerminal } from 'react-icons/fa';
import WalletComponent from './Wallet';
import TokensComponent from './Tokens';
import MusicComponent from './Music';
import TerminalComponent from './Terminal';

const components = [
  { 
    icon: FaWallet, 
    label: 'Lost', 
    component: WalletComponent
  },
  { 
    icon: FaChartLine, 
    label: 'Tokens', 
    component: TokensComponent
  },
  { 
    icon: FaMusic, 
    label: 'Music', 
    component: MusicComponent
  },
  { 
    icon: FaTerminal, 
    label: 'Terminal', 
    component: TerminalComponent
  }
];

export default function Sidebar({ onComponentSelect }) {
  return (
    <div className="w-20 bg-black/50 border-r border-green-800 flex flex-col items-center pt-10 z-10">
      {components.map((item, index) => (
        <div 
          key={index}
          onClick={() => onComponentSelect(item.component)}
          className="cursor-pointer hover:bg-green-800/30 p-4 w-full flex flex-col items-center"
        >
          <item.icon className="w-8 h-8 text-green-300" />
          <p className="text-xs mt-2">{item.label}</p>
        </div>
      ))}
    </div>
  );
}