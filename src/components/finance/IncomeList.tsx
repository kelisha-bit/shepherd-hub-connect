import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, DollarSign, MoreVertical, Edit, Trash2, User, Tag, FileText, Filter, ArrowUpDown, ChevronDown, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type Income = Database['public']['Tables']['incomes']['Row'];

interface IncomeCategory {
  id: string;
  name: string;
  color?: string;
}

interface IncomeListProps {
  incomes?: Income[];
  onEdit?: (income: Income) => void;
  onDelete?: (income: Income) => void;
  fetchData?: boolean;
  limit?: number;
  categoryFilter?: string;
  dateRange?: {
    from?: string;
    to?: string;
  };
  onFilterChange?: (filters: {
    limit?: number;
    categoryFilter?: string;
    dateRange?: {
      from?: string;
      to?: string;
    };
  }) => void;
}

export function IncomeList({ 
  incomes: propIncomes, 
  onEdit, 
  onDelete, 
  fetchData = false,
  limit,
  categoryFilter,
  dateRange,
  onFilterChange
}: IncomeListProps) {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingIncomes, setLoadingIncomes] = useState(fetchData);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Income>("income_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Helper functions 
  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown Category";
  }, [categories]);

  const getCategoryColor = useCallback((categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "bg-gray-100 text-gray-800";
  }, [categories]);

  const getInitials = useCallback((name?: string) => {
    if (!name) return "?";
    const words = name.split(" ").filter(Boolean);
    if (words.length === 1) return words[0][0]?.toUpperCase() || "?";
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }, []);
  
  // Handle sorting
  const handleSort = (column: keyof Income) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Handle date filtering
  const applyDateFilter = (date: Date | null, type: 'from' | 'to') => {
    if (!fetchData) return;
    
    const newDateRange = { 
      from: dateRange?.from, 
      to: dateRange?.to 
    };
    
    if (type === 'from') {
      newDateRange.from = date ? format(date, 'yyyy-MM-dd') : undefined;
    } else {
      newDateRange.to = date ? format(date, 'yyyy-MM-dd') : undefined;
    }
    
    if (onFilterChange) {
      onFilterChange({
        limit,
        categoryFilter,
        dateRange: newDateRange
      });
    } else {
      fetchIncomes();
    }
  };
  
  // Handle category filter change
  const applyCategoryFilter = (newCategoryFilter: string | undefined) => {
    if (!fetchData) return;
    
    if (onFilterChange) {
      onFilterChange({
        limit,
        categoryFilter: newCategoryFilter,
        dateRange
      });
    } else {
      fetchIncomes();
    }
  };
  
  // Handle limit change
  const applyLimitFilter = (newLimit: number | undefined) => {
    if (!fetchData) return;
    
    if (onFilterChange) {
      onFilterChange({
        limit: newLimit,
        categoryFilter,
        dateRange
      });
    } else {
      fetchIncomes();
    }
  };
  
  // Reset all filters
  const resetAllFilters = () => {
    if (!fetchData) return;
    
    if (onFilterChange) {
      onFilterChange({
        limit: undefined,
        categoryFilter: undefined,
        dateRange: { from: undefined, to: undefined }
      });
    } else {
      fetchIncomes();
    }
  };
  
  const displayIncomes = fetchData ? incomes : (propIncomes || []);
  
  // Sort and filter incomes
  const filteredAndSortedIncomes = displayIncomes
    .filter(income => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const categoryName = getCategoryName(income.category_id || "").toLowerCase();
      const source = (income.source || "").toLowerCase();
      const amount = income.amount.toString();
      const date = income.income_date ? format(new Date(income.income_date), 'MMM d, yyyy').toLowerCase() : "";
      
      return categoryName.includes(searchLower) || 
             source.includes(searchLower) || 
             amount.includes(searchTerm) ||
             date.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortColumn === "amount") {
        return sortDirection === "asc" 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
      
      if (sortColumn === "income_date") {
        const dateA = a.income_date ? new Date(a.income_date).getTime() : 0;
        const dateB = b.income_date ? new Date(b.income_date).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      const valA = String(a[sortColumn] || "").toLowerCase();
      const valB = String(b[sortColumn] || "").toLowerCase();
      return sortDirection === "asc" 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    });

  // Fetch incomes from Supabase
  const fetchIncomes = useCallback(async () => {
    if (!fetchData) return;
    
    setLoadingIncomes(true);
    try {
      let query = supabase
        .from('incomes')
        .select('*')
        .order('income_date', { ascending: false });
      
      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }
      
      if (dateRange?.from) {
        query = query.gte('income_date', dateRange.from);
      }
      
      if (dateRange?.to) {
        query = query.lte('income_date', dateRange.to);
      }
      
      if (limit && limit > 0) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setIncomes(data || []);
    } catch (error: any) {
      console.error('Error fetching incomes:', error);
      toast({
        title: "Error",
        description: `Failed to load income data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingIncomes(false);
    }
  }, [fetchData, categoryFilter, dateRange, limit, toast]);

  // Fetch categories from database
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from('income_categories')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch income categories',
          variant: 'destructive',
        });
      } else {
        const coloredCategories = (data || []).map((category, index) => {
          const colors = [
            "bg-blue-100 text-blue-800",
            "bg-green-100 text-green-800",
            "bg-purple-100 text-purple-800",
            "bg-yellow-100 text-yellow-800",
            "bg-pink-100 text-pink-800",
            "bg-indigo-100 text-indigo-800",
            "bg-red-100 text-red-800",
            "bg-orange-100 text-orange-800",
            "bg-teal-100 text-teal-800",
            "bg-cyan-100 text-cyan-800",
          ];
          return {
            ...category,
            color: colors[index % colors.length]
          };
        });
        setCategories(coloredCategories);
      }
    } catch (error) {
      console.error('Unexpected error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch income categories',
        variant: 'destructive',
      });
    } finally {
      setLoadingCategories(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  useEffect(() => {
    if (fetchData) {
      fetchIncomes();
    }
  }, [fetchData, fetchIncomes, categoryFilter, dateRange, limit]);

  const currencyFormatter = new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS'
  });

  const totalAmount = filteredAndSortedIncomes.reduce((sum, income) => sum + income.amount, 0);

  if (loadingIncomes) {
    return (
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4 border-b">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4 border-b">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                Income Records
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2 flex items-center gap-4">
                <span>{filteredAndSortedIncomes.length} {filteredAndSortedIncomes.length === 1 ? 'record' : 'records'}</span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Total: {currencyFormatter.format(totalAmount)}
                </span>
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Input
                  placeholder="Search income records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 w-full sm:w-64 focus-visible:ring-green-500"
                />
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              
              {fetchData && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? format(new Date(dateRange.from), "MMM d") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from ? new Date(dateRange.from) : undefined}
                        onSelect={(date) => applyDateFilter(date, 'from')}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.to ? format(new Date(dateRange.to), "MMM d") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to ? new Date(dateRange.to) : undefined}
                        onSelect={(date) => applyDateFilter(date, 'to')}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Tag className="mr-2 h-4 w-4" />
                        {categoryFilter ? getCategoryName(categoryFilter) : "All Categories"}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => applyCategoryFilter(undefined)}>
                        All Categories
                      </DropdownMenuItem>
                      {categories.map((category) => (
                        <DropdownMenuItem 
                          key={category.id}
                          onClick={() => applyCategoryFilter(category.id)}
                        >
                          <div className="flex items-center">
                            <div className={cn("w-3 h-3 rounded-full mr-2", category.color)} />
                            {category.name}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAllFilters}
                    className="text-muted-foreground"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {filteredAndSortedIncomes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600">No income records found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="p-4 font-semibold text-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("income_date")}
                        className="h-auto p-0 font-semibold"
                      >
                        Date
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-gray-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("amount")}
                        className="h-auto p-0 font-semibold"
                      >
                        Amount
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="p-4 font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="p-4 font-semibold text-gray-700">Source</TableHead>
                    <TableHead className="p-4 font-semibold text-gray-700">Description</TableHead>
                    {(onEdit || onDelete) && (
                      <TableHead className="p-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedIncomes.map((income) => (
                    <TableRow 
                      key={income.id} 
                      className="hover:bg-green-50/50 transition-colors duration-200 border-b border-gray-100"
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CalendarIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {income.income_date ? format(new Date(income.income_date), 'MMM d, yyyy') : '—'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {income.income_date ? format(new Date(income.income_date), 'EEEE') : ''}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-4">
                        <div className="font-bold text-lg text-green-700">
                          {currencyFormatter.format(income.amount)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-4">
                        {income.category_id ? (
                          <Badge className={cn("text-xs font-medium", getCategoryColor(income.category_id))}>
                            {getCategoryName(income.category_id)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No category</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {getInitials(income.source || "Unknown")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-700">
                            {income.source || "Unknown Source"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="p-4">
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {income.description || "—"}
                        </div>
                      </TableCell>
                      
                      {(onEdit || onDelete) && (
                        <TableCell className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(income)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem 
                                  onClick={() => onDelete(income)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}