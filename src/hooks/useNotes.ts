import { useState, useEffect } from 'react';

export interface Note {
  id: string;
  dateStr: string; // ISO string 'yyyy-MM-dd' or 'month-yyyy' for general notes
  text: string;
  timestamp: number;
  metadata?: {
    type: 'single' | 'range' | 'month';
    startIso?: string;
    endIso?: string;
  };
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Load notes on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('calendar_notes');
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  }, []);

  // Save notes on update
  useEffect(() => {
    try {
      localStorage.setItem('calendar_notes', JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }, [notes]);

  const addNote = (dateStr: string, text: string, metadata?: Note['metadata']) => {
    if (!text.trim()) return;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      dateStr,
      text,
      timestamp: Date.now(),
      metadata,
    };
    
    setNotes(prev => [...prev, newNote]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const getNotesForDate = (dateStr: string, dateIsoStr?: string) => {
    return notes.filter(note => {
      if (note.dateStr === dateStr) return true;
      if (dateIsoStr && note.metadata?.type === 'range' && note.metadata.startIso && note.metadata.endIso) {
        return dateIsoStr >= note.metadata.startIso && dateIsoStr <= note.metadata.endIso;
      }
      return false;
    });
  };
  
  const hasNotesForDate = (dateStrIso: string) => {
    return notes.some(note => {
      if (note.dateStr === dateStrIso) return true;
      if (note.metadata?.type === 'range' && note.metadata.startIso && note.metadata.endIso) {
        return dateStrIso >= note.metadata.startIso && dateStrIso <= note.metadata.endIso;
      }
      return false;
    });
  };

  return {
    notes,
    addNote,
    deleteNote,
    getNotesForDate,
    hasNotesForDate
  };
}
