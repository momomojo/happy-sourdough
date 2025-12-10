'use client';

import { useState } from 'react';
import { DiscountCode } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Copy, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DiscountCodeListProps {
  discountCodes: DiscountCode[];
}

export function DiscountCodeList({ discountCodes }: DiscountCodeListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update discount code');
      }

      toast.success(`Discount code ${!currentStatus ? 'activated' : 'deactivated'}`);
      router.refresh();
    } catch (error) {
      console.error('Error toggling discount code:', error);
      toast.error('Failed to update discount code');
    } finally {
      setTogglingId(null);
    }
  };

  const deleteCode = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete the discount code "${code}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete discount code');
      }

      toast.success('Discount code deleted');
      router.refresh();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast.error('Failed to delete discount code');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No limit';
    return new Date(date).toLocaleDateString();
  };

  const getDiscountDisplay = (code: DiscountCode) => {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`;
    } else if (code.discount_type === 'fixed') {
      return `$${code.discount_value?.toFixed(2)}`;
    } else {
      return 'Free Delivery';
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isMaxedOut = (code: DiscountCode) => {
    if (code.max_uses === null) return false;
    return code.current_uses >= code.max_uses;
  };

  if (discountCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No discount codes created yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Min. Order</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Valid Until</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discountCodes.map((code) => {
          const expired = isExpired(code.valid_until);
          const maxedOut = isMaxedOut(code);

          return (
            <TableRow key={code.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{code.code}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyCode(code.code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {code.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {code.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {code.discount_type === 'percentage' ? 'Percentage' :
                   code.discount_type === 'fixed' ? 'Fixed Amount' :
                   'Free Delivery'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {getDiscountDisplay(code)}
              </TableCell>
              <TableCell>
                {code.min_order_amount ? `$${code.min_order_amount.toFixed(2)}` : 'None'}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {code.current_uses} / {code.max_uses || '∞'}
                  </span>
                  {maxedOut && (
                    <Badge variant="destructive" className="mt-1 w-fit">
                      Max uses reached
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className={expired ? 'text-destructive' : ''}>
                    {formatDate(code.valid_until)}
                  </span>
                  {expired && (
                    <Badge variant="destructive" className="mt-1 w-fit">
                      Expired
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {code.is_active && !expired && !maxedOut ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => copyCode(code.code)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleActive(code.id, code.is_active)}
                      disabled={togglingId === code.id}
                    >
                      {code.is_active ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteCode(code.id, code.code)}
                      disabled={deletingId === code.id}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
