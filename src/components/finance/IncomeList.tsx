import { useState, useEffect, useCallback } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
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
import { Calendar as CalendarIcon, DollarSign, MoreVertical, Edit, Trash2, User, Tag, FileText, Filter, ArrowUpDown, ChevronDown } from "lucide-react";
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
    
    // Create a new date range object based on current dateRange
    const newDateRange = { 
      from: dateRange?.from, 
      to: dateRange?.to 
    };
    
    // Update the appropriate date
    if (type === 'from') {
      newDateRange.from = date ? format(date, 'yyyy-MM-dd') : undefined;
    } else {
      newDateRange.to = date ? format(date, 'yyyy-MM-dd') : undefined;
    }
    
    // Notify parent component of filter change if callback exists
    if (onFilterChange) {
      onFilterChange({
        limit,
        categoryFilter,
        dateRange: newDateRange
      });
    } else {
      // If no callback, just refresh with current filters
      fetchIncomes();
    }
  };
  
  // Handle category filter change
  const applyCategoryFilter = (newCategoryFilter: string | undefined) => {
    if (!fetchData) return;
    
    // Notify parent component of filter change if callback exists
    if (onFilterChange) {
      onFilterChange({
        limit,
        categoryFilter: newCategoryFilter,
        dateRange
      });
    } else {
      // If no callback, just refresh with current filters
      fetchIncomes();
    }
  };
  
  // Handle limit change
  const applyLimitFilter = (newLimit: number | undefined) => {
    if (!fetchData) return;
    
    // Notify parent component of filter change if callback exists
    if (onFilterChange) {
      onFilterChange({
        limit: newLimit,
        categoryFilter,
        dateRange
      });
    } else {
      // If no callback, just refresh with current filters
      fetchIncomes();
    }
  };
  
  // Reset all filters
  const resetAllFilters = () => {
    if (!fetchData) return;
    
    // Notify parent component of filter change if callback exists
    if (onFilterChange) {
      onFilterChange({
        limit: undefined,
        categoryFilter: undefined,
        dateRange: { from: undefined, to: undefined }
      });
    } else {
      // If no callback, just refresh with current filters
      fetchIncomes();
    }
  };
  
  // Use prop incomes or fetched incomes based on fetchData flag
  const displayIncomes = fetchData ? incomes : (propIncomes || []);
  
  // Sort and filter incomes
  const filteredAndSortedIncomes = displayIncomes
    .filter(income => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const categoryName = getCategoryName(income.category_id).toLowerCase();
      const source = (income.source || "").toLowerCase();
      const memberId = (income.member_id || "").toLowerCase();
      const amount = income.amount.toString();
      const date = income.income_date ? format(new Date(income.income_date), 'MMM d, yyyy').toLowerCase() : "";
      
      return categoryName.includes(searchLower) || 
             source.includes(searchLower) || 
             memberId.includes(searchLower) ||
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
      
      // Default string comparison for other columns
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
      
      // Apply category filter if provided
      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter);
      }
      
      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte('income_date', dateRange.from);
      }
      
      if (dateRange?.to) {
        query = query.lte('income_date', dateRange.to);
      }
      
      // Apply limit if provided
      if (limit > 0) {
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
        // Assign colors to categories
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

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Fetch incomes when fetchData is true or filters change
  useEffect(() => {
    if (fetchData) {
      fetchIncomes();
    }
  }, [fetchData, fetchIncomes, categoryFilter, dateRange, limit]);

  const currencyFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'GHS', currencyDisplay: 'code' });
  const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <TooltipProvider>
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Income Records
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                {filteredAndSortedIncomes.length} {filteredAndSortedIncomes.length === 1 ? 'record' : 'records'} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-lg">
                <div className="relative w-full">
                  <Input
                    placeholder="Search income records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 bg-white/80 w-full md:w-64 focus-visible:ring-blue-500"
                  />
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                
                {fetchData && (
                   <div className="flex gap-2">
                     <div className="flex items-center gap-2">
                       {/* From Date Picker */}
                       <Popover>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className={cn(
                               "justify-start text-left font-normal w-[130px]",
                               !dateRange?.from && "text-muted-foreground"
                             )}
                           >
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {dateRange?.from ? format(new Date(dateRange.from), "MMM d, yyyy") : "From Date"}
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                             mode="single"
                             selected={dateRange?.from ? new Date(dateRange.from) : undefined}
                             onSelect={(date) => applyDateFilter(date, 'from')}
                             initialFocus
                           />
                         </PopoverContent>
                       </Popover>
                       
                       {/* To Date Picker */}
                       <Popover>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             size="sm"
                             className={cn(
                               "justify-start text-left font-normal w-[130px]",
                               !dateRange?.to && "text-muted-foreground"
                             )}
                           >
                             <CalendarIcon className="mr-2 h-4 w-4" />
                             {dateRange?.to ? format(new Date(dateRange.to), "MMM d, yyyy") : "To Date"}
                           </Button>
                         </PopoverTrigger>
                         <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                             mode="single"
                             selected={dateRange?.to ? new Date(dateRange.to) : undefined}
                             onSelect={(date) => applyDateFilter(date, 'to')}
                             initialFocus
                           />
                         </PopoverContent>
                       </Popover>
                     </div>
                     
                     <div className="flex gap-2">
                        {/* Category Filter */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="whitespace-nowrap">
                              <Tag className="mr-2 h-4 w-4" />
                              {categoryFilter ? 
                                getCategoryName(categoryFilter) : 
                                "All Categories"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem 
                              onClick={() => applyCategoryFilter(undefined)}
                            >
                              All Categories
                            </DropdownMenuItem>
                            {categories.map((category) => (
                              <DropdownMenuItem 
                                key={category.id}
                                onClick={() => applyCategoryFilter(category.id)}
                              >
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: getCategoryColor(category.id) }}
                                  />
                                  {category.name}
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {/* Limit Selector */}
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="outline" size="sm" className="whitespace-nowrap">
                               <FileText className="mr-2 h-4 w-4" />
                               {limit ? `${limit} Records` : "All Records"}
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             {[10, 25, 50, 100].map((limitOption) => (
                               <DropdownMenuItem 
                                 key={limitOption}
                                 onClick={() => applyLimitFilter(limitOption)}
                               >
                                 {limitOption} Records
                               </DropdownMenuItem>
                             ))}
                             <DropdownMenuItem onClick={() => applyLimitFilter(undefined)}>
                                All Records
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                         
                         <Button 
                            variant="outline" 
                            size="sm" 
                            className="whitespace-nowrap"
                            onClick={resetAllFilters}
                          >
                            <Filter className="mr-2 h-4 w-4" />
                            Reset All
                          </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="whitespace-nowrap"
                          onClick={() => fetchIncomes()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                          Refresh
                        </Button>
                      </div>
                   </div>
                 )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-white/80">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter options</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold w-[140px]">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort("income_date")}
                    >
                      Date
                      {sortColumn === "income_date" && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                      {sortColumn === "amount" && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort("category_id")}
                    >
                      Category
                      {sortColumn === "category_id" && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort("source")}
                    >
                      Source
                      {sortColumn === "source" && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-1 p-0 h-auto font-semibold"
                      onClick={() => handleSort("member_id")}
                    >
                      Member
                      {sortColumn === "member_id" && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingIncomes ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`}>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-6 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedIncomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No matching income records found" : "No income records available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedIncomes.map((income) => (
                    <TableRow key={income.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-blue-700" />
                          </div>
                          <span>{income.income_date ? dateFormatter.format(new Date(income.income_date)) : '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold">
                          {currencyFormatter.format(income.amount).replace('GHS', 'Ghc')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loadingCategories ? (
                          <Skeleton className="h-6 w-24" />
                        ) : (
                          <Badge variant="outline" className={`${getCategoryColor(income.category_id)} border-0 font-medium`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {getCategoryName(income.category_id)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[180px]">
                          <span className="truncate" title={income.source || "-"}>{income.source || "-"}</span>
                          {income.notes && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{income.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 bg-blue-100 border border-blue-200">
                            <AvatarFallback className="text-xs text-blue-700 font-medium">
                              {income.member_id ? getInitials(income.source) : <User className="h-3 w-3" />}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]" title={income.member_id || "Anonymous"}>
                            {income.member_id || "Anonymous"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Actions</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="w-40">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(income)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                <span>Edit Record</span>
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(income)} className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Record</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination or summary footer */}
          <div className="py-3 px-4 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            {loadingIncomes ? (
              <div className="w-full flex justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-48" />
              </div>
            ) : filteredAndSortedIncomes.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <div>
                    Showing <span className="font-medium text-foreground">{filteredAndSortedIncomes.length}</span> of <span className="font-medium text-foreground">{displayIncomes.length}</span> records
                  </div>
                  {fetchData && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => fetchIncomes()}
                      title="Refresh data"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                    </Button>
                  )}
                </div>
                <div className="mt-2 sm:mt-0">
                  Total amount: <span className="font-medium text-green-600">{currencyFormatter.format(filteredAndSortedIncomes.reduce((sum, income) => sum + income.amount, 0)).replace('GHS', 'Ghc')}</span>
                </div>
              </>
            ) : (
              <div className="w-full text-center">No records to display</div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default IncomeList;