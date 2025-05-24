import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/store';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
}

export default function LogoutButton({ 
  variant = 'ghost', 
  size = 'default',
  showIcon = true
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className="flex items-center"
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  );
}