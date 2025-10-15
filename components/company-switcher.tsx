"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Building, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompanySwitcher() {
  const { user, switchCompany } = useAuth();
  const [open, setOpen] = useState(false);

  // Only show for CA role
  if (!user || user.role !== 'ca' || !user.companies) {
    return null;
  }

  const selectedCompany = user.selectedCompany || user.companies[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-lg">{selectedCompany.logo}</span>
            <span className="truncate">{selectedCompany.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandList>
            <CommandEmpty>No company found.</CommandEmpty>
            <CommandGroup heading="Companies">
              {user.companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    switchCompany(company.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{company.logo}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{company.name}</span>
                        {company.status === 'active' ? (
                          <Badge variant="default" className="h-4 text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="h-4 text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {company.industry} • {company.size} employees
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedCompany.id === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // In real app, would open add company dialog
                  console.log('Add new company');
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Company
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}