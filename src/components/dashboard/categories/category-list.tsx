"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Tag,
  ShoppingBasket,
  Car,
  Home,
  Heart,
  BookOpen,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Banknote,
  Briefcase,
  Gift,
  Upload,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  writeBatch,
  runTransaction,
  getDocs,
} from "firebase/firestore";
import type { Category, SubCategory } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToWindowEdges,
  restrictToVerticalAxis,
  restrictToFirstScrollableAncestor,
} from "@dnd-kit/modifiers";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/use-auth-state";

const iconComponents: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Tag,
  ShoppingBasket,
  Car,
  Home,
  Heart,
  BookOpen,
  Banknote,
  Briefcase,
  Gift,
};

const iconOptions = [
  { key: "Tag", label: "General" },
  { key: "ShoppingBasket", label: "Shopping" },
  { key: "Car", label: "Transport" },
  { key: "Home", label: "Home" },
  { key: "Heart", label: "Health" },
  { key: "BookOpen", label: "Education" },
  { key: "Banknote", label: "Finance" },
  { key: "Briefcase", label: "Work" },
  { key: "Gift", label: "Events" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLLAPSE_THRESHOLD = 8;

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconKey: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      <div className="grid grid-cols-5 gap-2">
        {iconOptions.map((opt) => {
          const IconComp = iconComponents[opt.key] || Tag;
          const isSelected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              title={opt.label}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md border py-2 px-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <IconComp className="h-4 w-4" />
              <span className="truncate max-w-full">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortableSubCategoryItem({
  subCategory,
  serialNumber,
  onEditSubCategory,
  onDeleteSubCategory,
  isEditable,
  isDragDisabled,
  isHighlighted,
}: {
  subCategory: SubCategory;
  serialNumber: number;
  onEditSubCategory: () => void;
  onDeleteSubCategory: () => void;
  isEditable: boolean;
  isDragDisabled: boolean;
  isHighlighted?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subCategory.id,
    disabled: !isEditable || isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "none",
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start justify-between gap-2 py-2 px-2 rounded-md transition-colors",
        isDragging ? "bg-card shadow-md ring-1 ring-primary/30" : "hover:bg-muted/50",
        isHighlighted && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {isEditable && !isDragDisabled && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${subCategory.name}`}
            className="text-muted-foreground/60 hover:text-foreground flex-shrink-0 pt-0.5 cursor-grab active:cursor-grabbing touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <span className="text-xs font-mono tabular-nums text-muted-foreground pt-0.5 w-5 flex-shrink-0">
          {serialNumber}.
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm leading-snug break-words text-foreground", isHighlighted && "font-medium text-primary")}>
            {subCategory.name}
          </p>
          {subCategory.frequency === "occasional" &&
            subCategory.selectedMonths &&
            subCategory.selectedMonths.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subCategory.selectedMonths.join(" · ")}
              </p>
            )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
        {subCategory.amount !== undefined && (
          <span className="font-mono tabular-nums text-xs font-medium text-foreground whitespace-nowrap">
            {formatCurrency(subCategory.amount)}
          </span>
        )}
        {isEditable && (
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onEditSubCategory}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Sub-category</TooltipContent>
            </Tooltip>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete Sub-category</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete sub-category?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove &ldquo;{subCategory.name}&rdquo; from this category.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteSubCategory}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableCategoryCard({
  category,
  categoryType,
  isEditable,
  searchQuery,
  frequencyFilter,
  onAddSubCategory,
  onEditCategory,
  onDeleteCategory,
  onEditSubCategory,
  onDeleteSubCategory,
  onSubCategoryOrderChange,
}: {
  category: Category;
  categoryType: "expense" | "income" | "bank-expense";
  isEditable: boolean;
  searchQuery: string;
  frequencyFilter: "all" | "monthly" | "occasional";
  onAddSubCategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onEditSubCategory: (category: Category, subCategory: SubCategory) => void;
  onDeleteSubCategory: (category: Category, subCategory: SubCategory) => void;
  onSubCategoryOrderChange: (category: Category, newSubcategories: SubCategory[]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isFiltered = Boolean(trimmedQuery) || frequencyFilter !== "all";

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled: !isEditable || isFiltered,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
  };

  const IconComponent = iconComponents[category.icon] || Tag;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const currentMonthName = months[new Date().getMonth()];

  const categoryMatchesQuery = Boolean(trimmedQuery && category.name.toLowerCase().includes(trimmedQuery));

  const visibleSubcategories = useMemo(() => {
    return (category.subcategories || []).filter((sub) => {
      if (categoryType !== "income" && frequencyFilter !== "all") {
        const isCurrentMonthly =
          sub.frequency === "monthly" ||
          (sub.frequency === "occasional" && sub.selectedMonths?.includes(currentMonthName));
        if (frequencyFilter === "monthly" && !isCurrentMonthly) return false;
        if (frequencyFilter === "occasional" && isCurrentMonthly) return false;
      }

      if (trimmedQuery && !categoryMatchesQuery) {
        return sub.name.toLowerCase().includes(trimmedQuery);
      }
      return true;
    });
  }, [category.subcategories, categoryType, frequencyFilter, currentMonthName, trimmedQuery, categoryMatchesQuery]);

  const shouldCollapse = !isFiltered && !isExpanded && visibleSubcategories.length > COLLAPSE_THRESHOLD;
  const displayedSubcategories = shouldCollapse
    ? visibleSubcategories.slice(0, COLLAPSE_THRESHOLD)
    : visibleSubcategories;

  const monthlySubcategories = useMemo(() => {
    return displayedSubcategories.filter(
      (s) =>
        s.frequency === "monthly" ||
        (s.frequency === "occasional" && s.selectedMonths?.includes(currentMonthName))
    );
  }, [displayedSubcategories, currentMonthName]);

  const occasionalSubcategories = useMemo(() => {
    return displayedSubcategories.filter(
      (s) => s.frequency === "occasional" && !s.selectedMonths?.includes(currentMonthName)
    );
  }, [displayedSubcategories, currentMonthName]);

  const monthlySectionTotal = useMemo(() => {
    return (category.subcategories || [])
      .filter(
        (s) =>
          s.frequency === "monthly" ||
          (s.frequency === "occasional" && s.selectedMonths?.includes(currentMonthName))
      )
      .reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [category.subcategories, currentMonthName]);

  const occasionalSectionTotal = useMemo(() => {
    return (category.subcategories || [])
      .filter((s) => s.frequency === "occasional" && !s.selectedMonths?.includes(currentMonthName))
      .reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [category.subcategories, currentMonthName]);

  const allSubcategoryIds = useMemo(() => (category.subcategories || []).map((s) => s.id), [category.subcategories]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditable || isFiltered) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = allSubcategoryIds.indexOf(active.id as string);
      const newIndex = allSubcategoryIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedSubcategories = arrayMove(category.subcategories, oldIndex, newIndex);
      onSubCategoryOrderChange(category, reorderedSubcategories);
    }
  };

  const totalAmount = useMemo(() => {
    if (categoryType === "expense" || categoryType === "bank-expense") {
      return (category.subcategories || [])
        .filter(
          (sub) =>
            sub.frequency === "monthly" ||
            (sub.frequency === "occasional" && sub.selectedMonths?.includes(currentMonthName))
        )
        .reduce((total, sub) => total + (sub.amount || 0), 0);
    }
    return (category.subcategories || []).reduce((total, sub) => total + (sub.amount || 0), 0);
  }, [category.subcategories, categoryType, currentMonthName]);

  const subCount = (category.subcategories || []).length;

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "flex flex-col border bg-card transition-shadow",
          isDragging && "shadow-lg ring-2 ring-primary/30"
        )}
      >
        <CardHeader className="p-4 pb-3 border-b space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold leading-snug tracking-tight break-words text-foreground">
                  {category.name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <span className="tabular-nums">
                    {subCount} {subCount === 1 ? "item" : "items"}
                  </span>
                  {totalAmount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-medium text-foreground">
                        {formatCurrency(totalAmount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">({currentMonthName})</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              {isEditable && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEditCategory(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Category</TooltipContent>
                  </Tooltip>
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Delete Category</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &ldquo;{category.name}&rdquo; and all {subCount} sub-categories inside it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteCategory(category.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {!isFiltered && (
                    <div
                      {...attributes}
                      {...listeners}
                      title="Drag to reorder category"
                      className="h-8 w-8 flex items-center justify-center text-muted-foreground/60 hover:text-foreground cursor-grab active:cursor-grabbing touch-none rounded-md"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
          >
            <SortableContext items={allSubcategoryIds} strategy={verticalListSortingStrategy}>
              {displayedSubcategories.length > 0 ? (
                <div className="space-y-3">
                  {categoryType === "expense" || categoryType === "bank-expense" ? (
                    <>
                      {monthlySubcategories.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-2 pb-1 text-xs text-muted-foreground">
                            <span className="font-medium">Monthly ({currentMonthName})</span>
                            {monthlySectionTotal > 0 && (
                              <span className="font-mono tabular-nums">
                                {formatCurrency(monthlySectionTotal)}
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-border/50">
                            {monthlySubcategories.map((sub, index) => (
                              <SortableSubCategoryItem
                                key={sub.id}
                                subCategory={sub}
                                serialNumber={index + 1}
                                isEditable={isEditable}
                                isDragDisabled={isFiltered}
                                isHighlighted={Boolean(trimmedQuery && sub.name.toLowerCase().includes(trimmedQuery))}
                                onEditSubCategory={() => onEditSubCategory(category, sub)}
                                onDeleteSubCategory={() => onDeleteSubCategory(category, sub)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {occasionalSubcategories.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-2 pb-1 text-xs text-muted-foreground">
                            <span className="font-medium">Other Months</span>
                            {occasionalSectionTotal > 0 && (
                              <span className="font-mono tabular-nums">
                                {formatCurrency(occasionalSectionTotal)}
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-border/50">
                            {occasionalSubcategories.map((sub, index) => (
                              <SortableSubCategoryItem
                                key={sub.id}
                                subCategory={sub}
                                serialNumber={monthlySubcategories.length + index + 1}
                                isEditable={isEditable}
                                isDragDisabled={isFiltered}
                                isHighlighted={Boolean(trimmedQuery && sub.name.toLowerCase().includes(trimmedQuery))}
                                onEditSubCategory={() => onEditSubCategory(category, sub)}
                                onDeleteSubCategory={() => onDeleteSubCategory(category, sub)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {displayedSubcategories.map((sub, index) => (
                        <SortableSubCategoryItem
                          key={sub.id}
                          subCategory={sub}
                          serialNumber={index + 1}
                          isEditable={isEditable}
                          isDragDisabled={isFiltered}
                          isHighlighted={Boolean(trimmedQuery && sub.name.toLowerCase().includes(trimmedQuery))}
                          onEditSubCategory={() => onEditSubCategory(category, sub)}
                          onDeleteSubCategory={() => onDeleteSubCategory(category, sub)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {isFiltered ? "No sub-categories match the current filter." : "No sub-categories added yet."}
                </div>
              )}
            </SortableContext>
          </DndContext>

          {!isFiltered && visibleSubcategories.length > COLLAPSE_THRESHOLD && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show fewer
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show all {visibleSubcategories.length} items
                </>
              )}
            </button>
          )}
        </CardContent>

        {isEditable && (
          <CardFooter className="p-3 pt-2 border-t bg-muted/20 mt-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5"
              onClick={() => onAddSubCategory(category)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Sub-category
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function MonthSelector({
  selectedMonths,
  onMonthToggle,
}: {
  selectedMonths: string[];
  onMonthToggle: (month: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Select Months</Label>
      <div className="grid grid-cols-4 gap-2">
        {months.map((month) => (
          <Button
            key={month}
            type="button"
            variant={selectedMonths.includes(month) ? "default" : "outline"}
            onClick={() => onMonthToggle(month)}
            className="h-8 text-xs"
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function CategoryList({
  categoryType,
  isEditable = true,
}: {
  categoryType: "expense" | "income" | "bank-expense";
  isEditable?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState<"all" | "monthly" | "occasional">("all");

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [isEditSubCategoryDialogOpen, setIsEditSubCategoryDialogOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  const [addCategoryIcon, setAddCategoryIcon] = useState<string>("Tag");
  const [editCategoryIcon, setEditCategoryIcon] = useState<string>("Tag");

  const [addFrequency, setAddFrequency] = useState<"monthly" | "occasional">("monthly");
  const [addSelectedMonths, setAddSelectedMonths] = useState<string[]>([]);

  const [editFrequency, setEditFrequency] = useState<"monthly" | "occasional">("monthly");
  const [editSelectedMonths, setEditSelectedMonths] = useState<string[]>([]);

  const [user, loading] = useAuthState();
  const [clientLoaded, setClientLoaded] = useState(false);

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && db) {
      setDataLoading(true);
      const q = query(
        collection(db, "categories"),
        where("userId", "==", user.uid),
        where("type", "==", categoryType),
        orderBy("order", "asc")
      );
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const userCategories: Category[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            const subcategoriesFromData = Array.isArray(data.subcategories)
              ? [...data.subcategories].sort((a: SubCategory, b: SubCategory) => (a.order || 0) - (b.order || 0))
              : [];

            return {
              id: doc.id,
              userId: data.userId,
              name: data.name,
              icon: data.icon,
              order: data.order,
              type: data.type,
              subcategories: subcategoriesFromData,
            };
          });
          setCategories(userCategories);
          setDataLoading(false);
        },
        () => {
          setDataLoading(false);
        }
      );
      return () => unsubscribe();
    } else if (!loading) {
      setDataLoading(false);
    }
  }, [user, loading, categoryType]);

  useEffect(() => {
    if (isEditSubCategoryDialogOpen && selectedSubCategory) {
      setEditFrequency(selectedSubCategory.frequency || "monthly");
      setEditSelectedMonths(selectedSubCategory.selectedMonths || []);
    }
  }, [isEditSubCategoryDialogOpen, selectedSubCategory]);

  useEffect(() => {
    if (isEditCategoryDialogOpen && selectedCategory) {
      setEditCategoryIcon(selectedCategory.icon || "Tag");
    }
  }, [isEditCategoryDialogOpen, selectedCategory]);

  const currentMonthName = months[new Date().getMonth()];

  const summary = useMemo(() => {
    let totalSubcategories = 0;
    let totalMonthlyBudget = 0;

    categories.forEach((cat) => {
      const subs = cat.subcategories || [];
      totalSubcategories += subs.length;
      if (categoryType === "expense" || categoryType === "bank-expense") {
        totalMonthlyBudget += subs
          .filter(
            (s) =>
              s.frequency === "monthly" ||
              (s.frequency === "occasional" && s.selectedMonths?.includes(currentMonthName))
          )
          .reduce((sum, s) => sum + (s.amount || 0), 0);
      } else {
        totalMonthlyBudget += subs.reduce((sum, s) => sum + (s.amount || 0), 0);
      }
    });

    return {
      totalCategories: categories.length,
      totalSubcategories,
      totalMonthlyBudget,
    };
  }, [categories, categoryType, currentMonthName]);

  const filteredCategories = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return categories.filter((cat) => {
      const subs = cat.subcategories || [];

      if (categoryType !== "income" && frequencyFilter !== "all") {
        const hasMatchingFreq = subs.some((s) => {
          const isCurrentMonthly =
            s.frequency === "monthly" ||
            (s.frequency === "occasional" && s.selectedMonths?.includes(currentMonthName));
          return frequencyFilter === "monthly" ? isCurrentMonthly : !isCurrentMonthly;
        });
        if (!hasMatchingFreq) return false;
      }

      if (!trimmedQuery) return true;
      if (cat.name.toLowerCase().includes(trimmedQuery)) return true;
      return subs.some((s) => s.name.toLowerCase().includes(trimmedQuery));
    });
  }, [categories, searchQuery, frequencyFilter, categoryType, currentMonthName]);

  const categoryIds = useMemo(() => filteredCategories.map((c) => c.id), [filteredCategories]);

  const handleMonthToggle = (month: string, setMonths: React.Dispatch<React.SetStateAction<string[]>>) => {
    setMonths((prev) => (prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]));
  };

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    if (!name) return;

    const newCategory = {
      userId: user.uid,
      name,
      icon: addCategoryIcon || "Tag",
      subcategories: [],
      order: categories.length,
      type: categoryType,
    };

    try {
      await addDoc(collection(db, "categories"), newCategory);
      setIsCategoryDialogOpen(false);
      setAddCategoryIcon("Tag");
      toast({ title: "Category added", description: `"${name}" has been created.` });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedCategory) return;
    const formData = new FormData(event.currentTarget);
    const newName = (formData.get("name") as string)?.trim();
    if (!newName) return;

    try {
      const categoryRef = doc(db, "categories", selectedCategory.id);
      await updateDoc(categoryRef, { name: newName, icon: editCategoryIcon || "Tag" });
      setIsEditCategoryDialogOpen(false);
      setSelectedCategory(null);
      toast({ title: "Category updated" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      toast({ title: "Category deleted" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleAddSubCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedCategory) return;

    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    if (!name) return;

    const existingSubcategories = selectedCategory.subcategories || [];
    const newSubCategory: SubCategory = {
      id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
      name,
      order: existingSubcategories.length,
    };

    if (categoryType === "expense" || categoryType === "bank-expense") {
      newSubCategory.frequency = addFrequency;
      if (addFrequency === "occasional") {
        newSubCategory.selectedMonths = addSelectedMonths;
      } else {
        delete newSubCategory.selectedMonths;
      }
      const amount = parseFloat(formData.get("amount") as string);
      if (!isNaN(amount) && amount >= 0) {
        newSubCategory.amount = amount;
      }
    }

    try {
      const categoryRef = doc(db, "categories", selectedCategory.id);
      await updateDoc(categoryRef, {
        subcategories: [...existingSubcategories, newSubCategory],
      });
      setIsSubCategoryDialogOpen(false);
      setSelectedCategory(null);
      toast({ title: "Sub-category added" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add sub-category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleEditSubCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !selectedCategory || !selectedSubCategory) return;

    const formData = new FormData(event.currentTarget);
    const updatedName = (formData.get("name") as string)?.trim();
    if (!updatedName) return;

    const newSubcategories = (selectedCategory.subcategories || []).map((sub) => {
      if (sub.id === selectedSubCategory.id) {
        const updatedSub: SubCategory = {
          ...sub,
          name: updatedName,
        };
        if (categoryType === "expense" || categoryType === "bank-expense") {
          updatedSub.frequency = editFrequency;
          if (editFrequency === "occasional") {
            updatedSub.selectedMonths = editSelectedMonths;
          } else {
            delete updatedSub.selectedMonths;
          }
          const newAmount = parseFloat(formData.get("amount") as string);
          if (!isNaN(newAmount) && newAmount >= 0) {
            updatedSub.amount = newAmount;
          } else {
            delete updatedSub.amount;
          }
        }
        return updatedSub;
      }
      return sub;
    });

    try {
      const categoryRef = doc(db, "categories", selectedCategory.id);
      await updateDoc(categoryRef, { subcategories: newSubcategories });
      setIsEditSubCategoryDialogOpen(false);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      toast({ title: "Sub-category updated" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update sub-category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleDeleteSubCategory = async (category: Category, subCategoryToDelete: SubCategory) => {
    if (!user) return;
    try {
      const categoryRef = doc(db, "categories", category.id);
      const newSubcategories = (category.subcategories || [])
        .filter((sub) => sub.id !== subCategoryToDelete.id)
        .map((sub, index) => ({ ...sub, order: index }));
      await updateDoc(categoryRef, { subcategories: newSubcategories });
      toast({ title: "Sub-category deleted" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete sub-category",
        description: error?.message || "Please try again.",
      });
    }
  };

  const handleSubCategoryOrderChange = useCallback(
    async (category: Category, newSubcategories: SubCategory[]) => {
      if (!user) return;
      const reorderedSubcategories = newSubcategories.map((sub, index) => ({ ...sub, order: index }));
      try {
        const categoryRef = doc(db, "categories", category.id);
        await updateDoc(categoryRef, { subcategories: reorderedSubcategories });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Reorder failed",
          description: error?.message || "Could not save new order.",
        });
      }
    },
    [user, toast]
  );

  const openSubCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setAddFrequency("monthly");
    setAddSelectedMonths([]);
    setIsSubCategoryDialogOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryIcon(category.icon || "Tag");
    setIsEditCategoryDialogOpen(true);
  };

  const openEditSubCategoryDialog = (category: Category, subCategory: SubCategory) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
    setIsEditSubCategoryDialogOpen(true);
  };

  async function handleDragEnd(event: DragEndEvent) {
    if (!isEditable || searchQuery.trim() || frequencyFilter !== "all") return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reorderedItems = arrayMove(categories, oldIndex, newIndex);
      setCategories(reorderedItems);

      const batch = writeBatch(db);
      reorderedItems.forEach((item, index) => {
        const docRef = doc(db, "categories", item.id);
        batch.update(docRef, { order: index });
      });
      batch.commit().catch(() => {
        toast({ variant: "destructive", title: "Reorder failed", description: "Could not save category order." });
      });
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const workbookWorksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workbookWorksheet, { header: 1 });

        if (!json || json.length < 1) {
          throw new Error("Excel file is empty or invalid.");
        }

        const categoryHeaders = (json[0] as string[]).filter(Boolean);
        const subCategoryData: { [key: string]: string[] } = {};

        categoryHeaders.forEach((header, colIndex) => {
          subCategoryData[header] = [];
          for (let rowIndex = 1; rowIndex < json.length; rowIndex++) {
            const row = json[rowIndex] as string[];
            if (row && row[colIndex]) {
              subCategoryData[header].push(row[colIndex]);
            }
          }
        });

        await runTransaction(db, async (transaction) => {
          const categoriesQuery = query(
            collection(db, "categories"),
            where("userId", "==", user.uid),
            where("type", "==", categoryType)
          );
          const existingCategoriesSnapshot = await getDocs(categoriesQuery);
          let currentOrder = existingCategoriesSnapshot.size;

          for (const categoryName of categoryHeaders) {
            const newSubcategories: SubCategory[] = subCategoryData[categoryName].map((subName, index) => ({
              id: new Date().getTime().toString() + Math.random().toString(36).substring(2, 9),
              name: subName,
              order: index,
              frequency: "occasional",
            }));

            const newCategoryData = {
              userId: user.uid,
              name: categoryName,
              icon: "Tag",
              subcategories: newSubcategories,
              order: currentOrder++,
              type: categoryType,
            };

            const newCategoryRef = doc(collection(db, "categories"));
            transaction.set(newCategoryRef, newCategoryData);
          }
        });

        toast({
          title: "Import Successful",
          description: `${categoryHeaders.length} categories have been imported.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message || "An unexpected error occurred during import.",
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const titleCase = (str: string) => {
    if (str === "bank-expense") return "Bank Expense";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading || dataLoading || !clientLoaded) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* Clean Summary Strip */}
        <div className="grid grid-cols-3 divide-x rounded-lg border bg-card">
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Categories</p>
            <p className="text-lg font-semibold font-mono tabular-nums text-foreground mt-0.5">
              {summary.totalCategories}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">Sub-categories</p>
            <p className="text-lg font-semibold font-mono tabular-nums text-foreground mt-0.5">
              {summary.totalSubcategories}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">{currentMonthName} Budget</p>
            <p className="text-lg font-semibold font-mono tabular-nums text-primary mt-0.5 truncate">
              {formatCurrency(summary.totalMonthlyBudget)}
            </p>
          </div>
        </div>

        {/* Search, Filter & Action Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search categories or sub-categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 bg-card"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {categoryType !== "income" && (
              <div className="inline-flex items-center p-1 bg-muted rounded-lg self-start sm:self-auto">
                {[
                  { id: "all" as const, label: "All" },
                  { id: "monthly" as const, label: `Monthly (${currentMonthName})` },
                  { id: "occasional" as const, label: "Other Months" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrequencyFilter(opt.id)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0",
                      frequencyFilter === opt.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isEditable && (
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 whitespace-nowrap shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Excel
              </Button>
              <Dialog
                open={isCategoryDialogOpen}
                onOpenChange={(open) => {
                  setIsCategoryDialogOpen(open);
                  if (open) setAddCategoryIcon("Tag");
                }}
              >
                <DialogTrigger asChild>
                  <Button type="button" size="sm" className="h-9 whitespace-nowrap shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {titleCase(categoryType)} Category
                  </Button>
                </DialogTrigger>
                <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[440px]">
                  <form onSubmit={handleAddCategory}>
                    <DialogHeader>
                      <DialogTitle>Add {titleCase(categoryType)} Category</DialogTitle>
                      <DialogDescription>
                        Choose a name and icon for your new {categoryType.replace("-", " ")} category.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Utilities" required />
                      </div>
                      <IconPicker value={addCategoryIcon} onChange={setAddCategoryIcon} />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Add Category</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Category Cards Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <SortableContext items={categoryIds} strategy={rectSortingStrategy}>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start">
              {filteredCategories.map((category) => (
                <SortableCategoryCard
                  key={category.id}
                  category={category}
                  categoryType={categoryType}
                  isEditable={isEditable}
                  searchQuery={searchQuery}
                  frequencyFilter={frequencyFilter}
                  onAddSubCategory={openSubCategoryDialog}
                  onEditCategory={openEditCategoryDialog}
                  onDeleteCategory={handleDeleteCategory}
                  onEditSubCategory={openEditSubCategoryDialog}
                  onDeleteSubCategory={handleDeleteSubCategory}
                  onSubCategoryOrderChange={handleSubCategoryOrderChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12 px-4 border border-dashed rounded-lg bg-card/50">
            <Tag className="h-9 w-9 mb-2.5 text-muted-foreground/70" />
            {categories.length === 0 ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  No {categoryType.replace("-", " ")} categories yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Create your first category or import categories from an Excel spreadsheet.
                </p>
                {isEditable && (
                  <Button type="button" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {titleCase(categoryType)} Category
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground">No matching categories found</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Try clearing your search or switching the schedule filter.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFrequencyFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Sub-category Dialog */}
      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[425px]">
          <form onSubmit={handleAddSubCategory}>
            <DialogHeader>
              <DialogTitle>Add Sub-category</DialogTitle>
              <DialogDescription>
                Add a new item under &ldquo;{selectedCategory?.name}&rdquo;.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sub-name">Name</Label>
                <Input id="sub-name" name="name" placeholder="e.g. Internet Bill" required />
              </div>
              {(categoryType === "expense" || categoryType === "bank-expense") && (
                <>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <RadioGroup
                      name="frequency"
                      value={addFrequency}
                      onValueChange={(value) => setAddFrequency(value as "monthly" | "occasional")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="r-monthly" />
                        <Label htmlFor="r-monthly">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="occasional" id="r-occasional" />
                        <Label htmlFor="r-occasional">Custom Months</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {addFrequency === "occasional" && (
                    <MonthSelector
                      selectedMonths={addSelectedMonths}
                      onMonthToggle={(month) => handleMonthToggle(month, setAddSelectedMonths)}
                    />
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Budget Amount (optional)</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="any"
                      placeholder="e.g. 500"
                      className="hide-number-arrows"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedCategory(null)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Sub-category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[440px]">
          <form onSubmit={handleEditCategory}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the name and icon for this category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedCategory?.name}
                  required
                />
              </div>
              <IconPicker value={editCategoryIcon} onChange={setEditCategoryIcon} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={() => setSelectedCategory(null)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Sub-Category Dialog */}
      <Dialog open={isEditSubCategoryDialogOpen} onOpenChange={setIsEditSubCategoryDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubCategory}>
            <DialogHeader>
              <DialogTitle>Edit Sub-category</DialogTitle>
              <DialogDescription>Update the details for this sub-category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sub-name">Name</Label>
                <Input
                  id="edit-sub-name"
                  name="name"
                  defaultValue={selectedSubCategory?.name || ""}
                  required
                />
              </div>
              {(categoryType === "expense" || categoryType === "bank-expense") && (
                <>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <RadioGroup
                      name="frequency"
                      value={editFrequency}
                      onValueChange={(value) => setEditFrequency(value as "monthly" | "occasional")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="er-monthly" />
                        <Label htmlFor="er-monthly">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="occasional" id="er-occasional" />
                        <Label htmlFor="er-occasional">Custom Months</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {editFrequency === "occasional" && (
                    <MonthSelector
                      selectedMonths={editSelectedMonths}
                      onMonthToggle={(month) => handleMonthToggle(month, setEditSelectedMonths)}
                    />
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount">Budget Amount (optional)</Label>
                    <Input
                      id="edit-amount"
                      name="amount"
                      type="number"
                      step="any"
                      defaultValue={selectedSubCategory?.amount ?? ""}
                      placeholder="e.g. 500"
                      className="hide-number-arrows"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
