import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid,
  Button
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface DatePickerProps {
  onSelectDate: (startDate: Date | null, endDate: Date | null) => void;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
  onSelectDate, 
  selectedStartDate, 
  selectedEndDate 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  useEffect(() => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);
  
  useEffect(() => {
    console.log('DatePicker rendered', { selectedStartDate, selectedEndDate });
  }, [selectedStartDate, selectedEndDate]);

  const getNextMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  };

  const isDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  const isInHoverRange = (date: Date) => {
    if (!selectedStartDate || !hoverDate || selectedEndDate) return false;
    return (date > selectedStartDate && date <= hoverDate) || 
           (date < selectedStartDate && date >= hoverDate);
  };
  
  const isRangeStart = (date: Date) => {
    return selectedStartDate && date.getTime() === selectedStartDate.getTime();
  };
  
  const isRangeEnd = (date: Date) => {
    return selectedEndDate && date.getTime() === selectedEndDate.getTime();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const generateDays = (month: Date) => {
    const days = [];
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7;
    firstDayOfWeek = firstDayOfWeek - 1;
    
    const prevMonth = new Date(month);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const daysInPrevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(month.getFullYear(), month.getMonth(), i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    const totalCells = 6 * 7;
    const remainingCells = totalCells - days.length;
    
    const nextMonth = new Date(month);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    for (let i = 1; i <= remainingCells; i++) {
      const day = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;

    console.log('Date clicked:', date);

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      console.log('Starting new selection with date:', date);
      onSelectDate(date, null);
    } else {
      console.log('Completing selection with date:', date);
      if (date < selectedStartDate) {
        onSelectDate(date, selectedStartDate);
      } else {
        onSelectDate(selectedStartDate, date);
      }
    }
  };

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const currentMonthDays = generateDays(currentMonth);
  const nextMonthDays = generateDays(getNextMonth(currentMonth));

  return (
    <Paper elevation={0} sx={{ 
      width: { xs: '100%', sm: '660px' }, 
      borderRadius: '8px', 
      overflow: 'hidden',
      boxShadow: 'none',
      maxHeight: { xs: '80vh', sm: 'auto' }
    }}>
      {}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
      }}>
        <Button 
          onClick={handlePrevMonth}
          sx={{ 
            minWidth: 'auto', 
            p: 0.5,
            color: '#333'
          }}
        >
          <ArrowBackIosNewIcon fontSize="small" sx={{ fontSize: '0.8rem' }} />
        </Button>
        
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {formatMonthYear(currentMonth)}
        </Typography>
        
        <Button 
          onClick={handleNextMonth}
          sx={{ 
            minWidth: 'auto', 
            p: 0.5,
            color: '#333'
          }}
        >
          <ArrowForwardIosIcon fontSize="small" sx={{ fontSize: '0.8rem' }} />
        </Button>
      </Box>

      {}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {}
        <Box sx={{ width: { xs: '100%', sm: '48%' }, px: 1.5, pb: 1.5 }}>
          {}
          <Grid container sx={{ mb: 0.5 }}>
            {weekdays.map((day, index) => (
              <Grid key={index} sx={{ width: `${100/7}%` }}>
                <Typography 
                  align="center" 
                  sx={{ 
                    fontSize: '0.75rem', 
                    color: '#6b6b6b',
                    fontWeight: 'medium'
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>
        
        {}
        <Grid container>
          {currentMonthDays.map((day, index) => (
            <Grid key={index} sx={{ width: `${100/7}%` }}>
              <Box 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateClick(day.date);
                }}
                onMouseEnter={() => setHoverDate(day.date)}
                onMouseLeave={() => setHoverDate(null)}
                sx={{
                  height: '36px',
                  width: '36px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDisabled(day.date) ? 'default' : 'pointer',
                  borderRadius: isRangeStart(day.date) || isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderTopLeftRadius: isRangeStart(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderTopRightRadius: isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderBottomLeftRadius: isRangeStart(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderBottomRightRadius: isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  backgroundColor: 
                    isRangeStart(day.date) || isRangeEnd(day.date)
                      ? '#9e9e9e'
                      : isInRange(day.date) || isInHoverRange(day.date)
                        ? '#f0f0f0'
                        : 'transparent',
                  color: 
                    isRangeStart(day.date) || isRangeEnd(day.date)
                      ? 'white'
                      : isDisabled(day.date)
                        ? '#c6c6c6'
                        : !day.isCurrentMonth
                          ? '#8f8f8f'
                          : isToday(day.date)
                            ? '#9e9e9e'
                            : '#333',
                  fontWeight: isToday(day.date) ? 'bold' : 'normal',
                  opacity: !day.isCurrentMonth ? 0.5 : 1,
                  '&:hover': {
                    backgroundColor: 
                      !isDisabled(day.date) && 
                      !(selectedStartDate && day.date.getTime() === selectedStartDate.getTime()) && 
                      !(selectedEndDate && day.date.getTime() === selectedEndDate.getTime())
                        ? '#f0f0f0'
                        : undefined
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {day.date.getDate()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      </Box>

      {}
      <Box sx={{ 
        p: 1.5, 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem', margin: '0 auto' }}>
          {formatMonthYear(getNextMonth(currentMonth))}
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        {}
        <Grid container sx={{ mb: 0.5 }}>
          {weekdays.map((day, index) => (
            <Grid key={index} sx={{ width: `${100/7}%` }}>
              <Typography 
                align="center" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#6b6b6b',
                  fontWeight: 'medium'
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {}
        <Grid container>
          {nextMonthDays.map((day, index) => (
            <Grid key={index} sx={{ width: `${100/7}%` }}>
              <Box 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateClick(day.date);
                }}
                onMouseEnter={() => setHoverDate(day.date)}
                onMouseLeave={() => setHoverDate(null)}
                sx={{
                  height: '36px',
                  width: '36px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDisabled(day.date) ? 'default' : 'pointer',
                  borderRadius: isRangeStart(day.date) || isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderTopLeftRadius: isRangeStart(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderTopRightRadius: isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderBottomLeftRadius: isRangeStart(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  borderBottomRightRadius: isRangeEnd(day.date) ? '50%' : 
                    (isInRange(day.date) || isInHoverRange(day.date) ? 0 : '50%'),
                  backgroundColor: 
                    isRangeStart(day.date) || isRangeEnd(day.date)
                      ? '#9e9e9e'
                      : isInRange(day.date) || isInHoverRange(day.date)
                        ? '#f0f0f0'
                        : 'transparent',
                  color: 
                    isRangeStart(day.date) || isRangeEnd(day.date)
                      ? 'white'
                      : isDisabled(day.date)
                        ? '#c6c6c6'
                        : !day.isCurrentMonth
                          ? '#8f8f8f'
                          : isToday(day.date)
                            ? '#9e9e9e'
                            : '#333',
                  fontWeight: isToday(day.date) ? 'bold' : 'normal',
                  opacity: !day.isCurrentMonth ? 0.5 : 1,
                  '&:hover': {
                    backgroundColor: 
                      !isDisabled(day.date) && 
                      !(selectedStartDate && day.date.getTime() === selectedStartDate.getTime()) && 
                      !(selectedEndDate && day.date.getTime() === selectedEndDate.getTime())
                        ? '#f0f0f0'
                        : undefined
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {day.date.getDate()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        gap: 1
      }}>
        <Button 
          variant="outlined" 
          size="small"
          sx={{ 
            borderRadius: '16px', 
            borderColor: '#9e9e9e',
            color: '#616161',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#616161',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          Exact dates
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          sx={{ 
            borderRadius: '16px', 
            borderColor: '#9e9e9e',
            color: '#616161',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#616161',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          1 day
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          sx={{ 
            borderRadius: '16px', 
            borderColor: '#9e9e9e',
            color: '#616161',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#616161',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          2 days
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          sx={{ 
            borderRadius: '16px', 
            borderColor: '#9e9e9e',
            color: '#616161',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#616161',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          3 days
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          sx={{ 
            borderRadius: '16px', 
            borderColor: '#9e9e9e',
            color: '#616161',
            fontSize: '0.75rem',
            '&:hover': {
              borderColor: '#616161',
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          7 days
        </Button>
      </Box>
    </Paper>
  );
}

export default DatePicker;