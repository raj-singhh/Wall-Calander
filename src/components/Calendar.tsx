'use client'

import { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  setYear,
  setMonth,
  isWithinInterval,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import styles from './Calendar.module.css';
import { useNotes } from '@/hooks/useNotes';

type SelectionMode = 'single' | 'range';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selection states
  const [mode, setMode] = useState<SelectionMode>('single');
  const [selectedSingle, setSelectedSingle] = useState<Date | null>(new Date()); // Default to today
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  
  // Notes
  const { notes, addNote, deleteNote, hasNotesForDate, getNotesForDate } = useNotes();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Date generators
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Month navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine current active date context for notes
  const activeDateStr = useMemo(() => {
    if (mode === 'single' && selectedSingle) {
      return format(selectedSingle, 'yyyy-MM-dd');
    }
    if (mode === 'range') {
      if (rangeStart && rangeEnd) {
        return `${format(rangeStart, 'MMM d')} - ${format(rangeEnd, 'MMM d, yyyy')}`;
      } else if (rangeStart) {
        return format(rangeStart, 'yyyy-MM-dd');
      }
    }
    return format(currentDate, 'MMM yyyy'); // fallback generic month notes
  }, [mode, selectedSingle, rangeStart, rangeEnd, currentDate]);

  const onDateClick = (day: Date) => {
    if (mode === 'single') {
      setSelectedSingle(day);
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(day);
        setRangeEnd(null);
      } else if (rangeStart && !rangeEnd) {
        if (isBefore(day, rangeStart)) {
          setRangeStart(day);
        } else {
          setRangeEnd(day);
        }
      }
    }
  };

  const getDayClasses = (day: Date) => {
    const classes = [styles.dayCell];
    
    if (!isSameMonth(day, monthStart)) {
      classes.push(styles.empty); // Hide days not in month for cleaner physical look
      return classes.join(' ');
    }

    if (isSameDay(day, new Date())) classes.push(styles.isToday);

    if (mode === 'single' && selectedSingle && isSameDay(day, selectedSingle)) {
      classes.push(styles.selectedSingle);
    } else if (mode === 'range') {
      if (rangeStart && isSameDay(day, rangeStart)) {
        classes.push(rangeEnd ? styles.selectedRangeStart : styles.selectedSingle);
      }
      if (rangeEnd && isSameDay(day, rangeEnd)) {
        classes.push(styles.selectedRangeEnd);
      }
      if (rangeStart && rangeEnd && isWithinInterval(day, { start: rangeStart, end: rangeEnd }) && !isSameDay(day, rangeStart) && !isSameDay(day, rangeEnd)) {
        classes.push(styles.selectedRangeMiddle);
      }
    }

    return classes.join(' ');
  };

  const renderGridRows = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Header
    const headerDivs = weekDays.map((d, i) => (
      <div key={`head-${i}`} className={styles.dayOfWeek}>
        {d}
      </div>
    ));
    rows.push(<div key="header-row" className={styles.grid}>{headerDivs}</div>);

    // Grid
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const currentIso = format(cloneDay, 'yyyy-MM-dd');
        
        days.push(
          <div
            key={cloneDay.toISOString()}
            className={getDayClasses(cloneDay)}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className={styles.dayNumber}>{formattedDate}</span>
            {hasNotesForDate(currentIso) && !isSameMonth(cloneDay, monthStart) === false && (
              <div className={styles.hasNotesDot} />
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toISOString()} className={styles.grid}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setYear(currentDate, parseInt(e.target.value)));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(setMonth(currentDate, parseInt(e.target.value)));
  };

  const saveNote = () => {
    const metadata: any = { type: mode };
    if (mode === 'single' && selectedSingle) {
      metadata.startIso = format(selectedSingle, 'yyyy-MM-dd');
      metadata.endIso = format(selectedSingle, 'yyyy-MM-dd');
    } else if (mode === 'range' && rangeStart) {
      if (rangeEnd) {
        if (isBefore(rangeEnd, rangeStart)) {
          metadata.startIso = format(rangeEnd, 'yyyy-MM-dd');
          metadata.endIso = format(rangeStart, 'yyyy-MM-dd');
        } else {
          metadata.startIso = format(rangeStart, 'yyyy-MM-dd');
          metadata.endIso = format(rangeEnd, 'yyyy-MM-dd');
        }
      } else {
        metadata.startIso = format(rangeStart, 'yyyy-MM-dd');
        metadata.endIso = format(rangeStart, 'yyyy-MM-dd');
      }
    }

    addNote(activeDateStr, newNoteText, metadata);
    setNewNoteText('');
    setIsAddingNote(false);
  };

  // Generate Year Options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 61}, (_, i) => currentYear - 30 + i);
  
  // Generate Month Options
  const monthOptions = Array.from({length: 12}, (_, i) => ({
    val: i,
    label: format(new Date(2000, i, 1), 'MMMM')
  }));

  let selectedIso: string | undefined = undefined;
  if (mode === 'single' && selectedSingle) {
    selectedIso = format(selectedSingle, 'yyyy-MM-dd');
  }

  const activeNotes = getNotesForDate(activeDateStr, selectedIso);

  return (
    <div className={styles.calendarWrapper}>
      
      {/* Settings Row */}
      <div className={styles.optionsRow}>
        <div className={styles.modeToggle}>
          <button 
            className={`${styles.modeButton} ${mode === 'single' ? styles.active : ''}`}
            onClick={() => setMode('single')}
          >
            Single Date
          </button>
          <button 
            className={`${styles.modeButton} ${mode === 'range' ? styles.active : ''}`}
            onClick={() => setMode('range')}
          >
            Date Range
          </button>
        </div>
      </div>

      {/* Header Month/Year Selector */}
      <div className={styles.header}>
        <div className={styles.yearMonthSelectors}>
          <select 
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            className={styles.select}
          >
            {monthOptions.map(m => (
              <option key={m.val} value={m.val}>{m.label}</option>
            ))}
          </select>
          <select 
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className={styles.select}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.controls}>
          <button onClick={prevMonth} className={styles.navigationButton}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className={styles.navigationButton}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.calendarContent}>
        {renderGridRows()}
      </div>

      {/* Notes Section connected to Selection */}
      <div className={styles.notesSection}>
        <div className={styles.notesHeader}>
          <h3>
            <CalendarIcon size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: '-3px'}}/>
            Notes for {
              mode === 'single' && selectedSingle 
                ? format(selectedSingle, 'MMM do, yyyy')
                : (mode === 'range' && rangeEnd && rangeStart ? `${format(rangeStart, 'MMM do')} - ${format(rangeEnd, 'MMM do')}` : activeDateStr)
            }
          </h3>
          <button className={styles.addNoteButton} onClick={() => setIsAddingNote(true)}>
            <Plus size={16} /> Add Note
          </button>
        </div>

        {isAddingNote && (
          <div className={styles.newNoteForm}>
            <textarea 
              className={styles.noteTextarea}
              placeholder="Jot something down..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              autoFocus
            />
            <div className={styles.noteActions}>
              <button className={styles.cancelButton} onClick={() => setIsAddingNote(false)}>Cancel</button>
              <button className={styles.saveButton} onClick={saveNote}>Save</button>
            </div>
          </div>
        )}

        <div className={styles.notesList}>
          {activeNotes.length === 0 && !isAddingNote && (
            <p className={styles.noteText} style={{opacity: 0.6}}>No notes attached to this selection.</p>
          )}
          {activeNotes.map(n => (
            <div key={n.id} className={styles.noteItem}>
              <div className={styles.noteContent}>
                <div className={styles.noteDate}>{format(new Date(n.timestamp), 'MMM d, h:mm a')}</div>
                <div className={styles.noteText}>{n.text}</div>
              </div>
              <button className={styles.deleteNote} onClick={() => deleteNote(n.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
