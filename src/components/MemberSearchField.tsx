'use client';

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import { useGlobalSearch } from '@/hooks/queries/search';
import { useDebounce } from '@/hooks/useDebounce';

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
  const debouncedQuery = useDebounce(inputValue, 250);
  const normalizedQuery = debouncedQuery.trim();
  
  const { data: searchData, isLoading: loading } = useGlobalSearch(normalizedQuery);
  const options = searchData?.members ?? [];

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  return (
    <Autocomplete<MemberSearchResult, false, false, false>
      fullWidth
      options={options}
      loading={loading}
      filterOptions={items => items}
      inputValue={inputValue}
      onInputChange={(_, value) => {
        setInputValue(value);
      }}
      onChange={(_, member) => onSelect(member)}
      getOptionLabel={member => `${member.firstName} ${member.lastName} · ${member.memberNumber}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={inputValue.trim().length < 2 ? 'Type at least 2 characters' : 'No members found'}
      renderOption={(props, member) => {
        const { key, ...optionProps } = props;
        return (
          <Box component="li" {...optionProps} key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{member.firstName} {member.lastName}</Typography>
              <Typography variant="caption" color="text.secondary">{member.memberNumber} · {member.phone}</Typography>
            </Box>
            <Chip label={member.status === 'EXPIRED' ? 'EXPIRED' : member.status} color={member.status === 'EXPIRED' ? 'error' : member.status === 'ACTIVE' ? 'success' : 'default'} size="small" />
          </Box>
        );
      }}
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
