"use client";

import { useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
};

type Props = {
  customCategories: Category[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function CategoryManager({ customCategories, onCreate, onUpdate, onDelete }: Props) {
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Custom Categories</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Add custom category"
          value={newCategory}
          maxLength={40}
          onChange={(event) => setNewCategory(event.target.value)}
        />
        <Button
          onClick={() => {
            if (!newCategory.trim()) return;
            void onCreate(newCategory.trim());
            setNewCategory("");
          }}
        >
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {customCategories.length ? (
          customCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700"
            >
              {editingId === category.id ? (
                <Input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  maxLength={40}
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-200">{category.name}</p>
              )}

              <div className="flex items-center gap-1">
                {editingId === category.id ? (
                  <>
                    <button
                      className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                      onClick={() => {
                        if (!editingName.trim()) return;
                        void onUpdate(category.id, editingName.trim());
                        setEditingId(null);
                      }}
                      aria-label="Save category"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      aria-label="Edit category"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      onClick={() => {
                        void onDelete(category.id);
                      }}
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No custom categories yet. Create one above.
          </p>
        )}
      </div>
    </Card>
  );
}
