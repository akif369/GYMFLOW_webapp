'use client';
import {
  Box, Card, CardContent, Typography, Chip, Stack, Divider, Button, alpha,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const INVOICES = [
  { id: 'INV-2240', date: '01 Aug 2026', dueDate: '01 Aug 2026', plan: 'Premium Monthly', amount: 2999, status: 'PAID', method: 'UPI' },
  { id: 'INV-2180', date: '01 Jul 2026', dueDate: '01 Jul 2026', plan: 'Premium Monthly', amount: 2999, status: 'PAID', method: 'Card' },
  { id: 'INV-2120', date: '01 Jun 2026', dueDate: '01 Jun 2026', plan: 'Standard Monthly', amount: 1999, status: 'PAID', method: 'Cash' },
  { id: 'INV-2060', date: '01 May 2026', dueDate: '01 May 2026', plan: 'Standard Monthly', amount: 1999, status: 'PAID', method: 'UPI' },
  { id: 'INV-2000', date: '01 Apr 2026', dueDate: '01 Apr 2026', plan: 'Standard Monthly', amount: 1999, status: 'PAID', method: 'Card' },
];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PAID:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  OVERDUE: { bg: 'rgba(244,63,94,0.1)',  color: '#f87171' },
};

export default function MemberInvoicesPage() {
  const totalPaid = INVOICES.filter((i) => i.status === 'PAID').reduce((acc, i) => acc + i.amount, 0);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.5 }}>
            Billing & Payments
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
            My Invoices
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>Total paid</Typography>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.05em' }}>
            ₹{totalPaid.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Card elevation={0}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack divider={<Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}>
            {INVOICES.map((invoice) => {
              const sc = STATUS_STYLES[invoice.status] ?? STATUS_STYLES['PENDING']!;
              const isPaid = invoice.status === 'PAID';
              return (
                <Box key={invoice.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 2, py: 1.75,
                  flexWrap: 'wrap',
                }}>
                  {/* Icon */}
                  <Box sx={{
                    width: 38, height: 38, borderRadius: 1.5, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(sc.color, 0.1),
                  }}>
                    {isPaid
                      ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: sc.color }} />
                      : <WarningAmberRoundedIcon sx={{ fontSize: 18, color: sc.color }} />}
                  </Box>

                  {/* Details */}
                  <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'text.primary' }}>
                        {invoice.id}
                      </Typography>
                      <Chip label={invoice.status} size="small"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: sc.bg, color: sc.color }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {invoice.plan} · {invoice.date} · {invoice.method}
                    </Typography>
                  </Box>

                  {/* Amount */}
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary', letterSpacing: '-0.03em', minWidth: 80, textAlign: 'right' }}>
                    ₹{invoice.amount.toLocaleString()}
                  </Typography>

                  {/* Download */}
                  <Button
                    size="small"
                    startIcon={<DownloadRoundedIcon sx={{ fontSize: 15 }} />}
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.1)', color: 'text.secondary',
                      '&:hover': { borderColor: '#10b981', color: '#10b981', bgcolor: 'rgba(16,185,129,0.06)' },
                      fontSize: '0.75rem', minWidth: 90,
                    }}
                  >
                    PDF
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
