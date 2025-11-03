"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { Topic } from "@/lib/db/schema";

interface TopicsManagerProps {
  initialTopics: Topic[];
}

export function TopicsManager({ initialTopics }: TopicsManagerProps) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [newTopicName, setNewTopicName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTopicName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName.trim() }),
      });

      if (response.ok) {
        const newTopic = await response.json();
        setTopics([...topics, newTopic].sort((a, b) => a.name.localeCompare(b.name)));
        setNewTopicName("");
      }
    } catch (error) {
      console.error("Failed to create topic:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        const updatedTopic = await response.json();
        setTopics(
          topics
            .map((t) => (t.id === id ? updatedTopic : t))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        setEditingName("");
      }
    } catch (error) {
      console.error("Failed to update topic:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic? This will remove it from all events and sessions.")) {
      return;
    }

    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTopics(topics.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  const startEdit = (topic: Topic) => {
    setEditingId(topic.id);
    setEditingName(topic.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-4">
      {/* Create new topic */}
      <div className="rounded-lg border p-4 bg-muted/20">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
            placeholder="Enter new topic name..."
            className="flex-1"
          />
          <Button onClick={handleCreate} disabled={isCreating || !newTopicName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </div>
      </div>

      {/* Topics list */}
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-muted/50">
          <h2 className="font-semibold">All Topics ({topics.length})</h2>
        </div>
        <div className="divide-y">
          {topics.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No topics yet. Create one above to get started.
            </div>
          ) : (
            topics.map((topic) => (
              <div key={topic.id} className="p-4 flex items-center gap-3 hover:bg-muted/50">
                {editingId === topic.id ? (
                  <>
                    <Input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdate(topic.id);
                        } else if (e.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdate(topic.id)}
                      disabled={!editingName.trim()}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 font-medium">{topic.name}</div>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(topic)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(topic.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
