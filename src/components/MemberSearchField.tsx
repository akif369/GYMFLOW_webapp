'use client';

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import { api } from '@/lib/api';

export type MemberSearchResult = {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
};

type Props = {
  label?: string;
  helperText?: string;
  autoFocus?: boolean;
  onSelect: (member: MemberSearchResult | null) => void;
};

export default function MemberSearchField({ label = 'Search member', helperText = 'Search by member number or name', autoFocus, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<MemberSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = inputValue.trim();
    if (query.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get('/search', { params: { q: query }, signal: controller.signal });
        setOptions(response.data?.members ?? []);
      } catch (error: any) {
        if (error?.code !== 'ERR_CANCELED') setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [inputValue]);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  return (
    <Autocomplete
      fullWidth
      options={options}
      loading={loading}
      filterOptions={items => items}
      inputValue={inputValue}
      onInputChange={(_, value) => {
        setInputValue(value);
        if (value.trim().length < 2) setOptions([]);
      }}
      onChange={(_, member) => onSelect(member)}
      getOptionLabel={member => `${member.firstName} ${member.lastName} · ${member.memberNumber}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={inputValue.trim().length < 2 ? 'Type at least 2 characters' : 'No members found'}
      renderOption={(props, member) => (
        <Box component="li" {...props} key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700}>{member.firstName} {member.lastName}</Typography>
            <Typography variant="caption" color="text.secondary">{member.memberNumber} · {member.phone}</Typography>
          </Box>
          <Chip label={member.status === 'EXPIRED' ? 'EXPIRED' : member.status} color={member.status === 'EXPIRED' ? 'error' : member.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
        </Box>
      )}
      renderInput={params => (
        <TextField
          {...params}
          inputRef={inputRef}
          label={label}
          size="small"
          helperText={helperText}
          placeholder="Name or GYM0001"
        />
      )}
    />
  );
}
