'use client';

import { useEffect, useState } from 'react';
import { Autocomplete, Box, Chip, CircularProgress, TextField, Typography } from '@mui/material';
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
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<MemberSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = inputValue.trim();
    if (query.length < 2) {
      setOptions([]);
      return;
    }

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

  return (
    <Autocomplete
      fullWidth
      options={options}
      loading={loading}
      filterOptions={items => items}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
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
          label={label}
          size="small"
          autoFocus={autoFocus}
          helperText={helperText}
          placeholder="Name or GYM0001"
        />
      )}
    />
  );
}
