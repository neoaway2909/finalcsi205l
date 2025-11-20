import React, { useState } from "react";
import { FaUser, FaUserMd, FaUserTie, FaCheck } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const RoleSelectionModal = ({ onRoleSelect, onCancel }) => {
  const [selectedRole, setSelectedRole] = useState("patient");

  const handleConfirm = () => {
    onRoleSelect(selectedRole);
  };

  const roles = [
    {
      icon: FaUser,
      title: "คนไข้",
      role: "patient",
      color: "border-blue-500 bg-blue-50 text-blue-600",
      hoverColor: "hover:border-blue-500 hover:bg-blue-50/50",
      iconColor: "text-blue-500"
    },
    {
      icon: FaUserMd,
      title: "แพทย์",
      role: "doctor",
      color: "border-green-500 bg-green-50 text-green-600",
      hoverColor: "hover:border-green-500 hover:bg-green-50/50",
      iconColor: "text-green-500"
    },
    {
      icon: FaUserTie,
      title: "แอดมิน",
      role: "admin",
      color: "border-yellow-500 bg-yellow-50 text-yellow-600",
      hoverColor: "hover:border-yellow-500 hover:bg-yellow-50/50",
      iconColor: "text-yellow-500"
    }
  ];

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            เลือกบทบาทของคุณ
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            กรุณาเลือกว่าคุณต้องการเข้าใช้งานในฐานะใด
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-6">
          {roles.map((roleItem) => {
            const RoleIcon = roleItem.icon;
            return (
              <button
                key={roleItem.role}
                onClick={() => setSelectedRole(roleItem.role)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-4 p-6 rounded-lg border-2 transition-all duration-200",
                  selectedRole === roleItem.role
                    ? roleItem.color
                    : "border-gray-200 bg-white hover:shadow-md " + roleItem.hoverColor
                )}
              >
                <RoleIcon
                  size={40}
                  className={selectedRole === roleItem.role ? roleItem.iconColor : "text-gray-400"}
                />
                <p className={cn(
                  "font-medium text-lg",
                  selectedRole === roleItem.role ? "" : "text-gray-600"
                )}>
                  {roleItem.title}
                </p>
                {selectedRole === roleItem.role && (
                  <div className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-sm">
                    <FaCheck size={16} className={roleItem.iconColor} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              ยกเลิก
            </Button>
          )}
          <Button onClick={handleConfirm} className="min-w-[120px]">
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionModal;
