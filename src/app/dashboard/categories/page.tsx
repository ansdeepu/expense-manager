"use client";

import { CategoryList } from "@/components/dashboard/categories/category-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize expense, income, and bank-expense categories along with monthly or seasonal budgets.
        </p>
      </div>

      <Tabs defaultValue="expense" className="w-full space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto w-full sm:w-auto p-1 bg-muted rounded-lg">
            <TabsTrigger value="expense" className="flex-1 sm:flex-initial whitespace-nowrap shrink-0 px-4 py-2 text-xs sm:text-sm">
              Expense
            </TabsTrigger>
            <TabsTrigger value="income" className="flex-1 sm:flex-initial whitespace-nowrap shrink-0 px-4 py-2 text-xs sm:text-sm">
              Income
            </TabsTrigger>
            <TabsTrigger value="bank-expense" className="flex-1 sm:flex-initial whitespace-nowrap shrink-0 px-4 py-2 text-xs sm:text-sm">
              Bank Expense
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="expense" className="mt-0">
          <CategoryList categoryType="expense" />
        </TabsContent>
        <TabsContent value="income" className="mt-0">
          <CategoryList categoryType="income" />
        </TabsContent>
        <TabsContent value="bank-expense" className="mt-0">
          <CategoryList categoryType="bank-expense" isEditable={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

