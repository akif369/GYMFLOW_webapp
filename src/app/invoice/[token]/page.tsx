'use client';

import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Container, Button, Typography } from '@mui/material';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import { api } from '@/lib/api';

type InvoiceData = {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  totalAmount: number | string;
  subtotal: number | string;
  gstAmount: number | string;
  taxIncluded: boolean;
  memberId: string | null;
  memberName: string | null;
  notes: string | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    totalAmount: number;
  }>;
  organization: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    gstNumber: string | null;
    city: string | null;
  };
  footer?: string;
  createdAt: string;
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    paid: { label: 'Paid', color: '#17663a', bg: '#e8f6ee' },
    sent: { label: 'Sent', color: '#92620a', bg: '#fdf3dc' },
    pending: { label: 'Pending', color: '#92620a', bg: '#fdf3dc' },
    overdue: { label: 'Overdue', color: '#a12626', bg: '#fbe8e8' },
    draft: { label: 'Draft', color: '#475069', bg: '#eef0f4' },
    cancelled: { label: 'Cancelled', color: '#475069', bg: '#eef0f4' }, // strikethrough handled below
  };
  return map[(status || '').toLowerCase()] || { label: status || 'Unknown', color: '#475069', bg: '#eef0f4' };
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]!;
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

function threeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return `${hundred ? `${ONES[hundred]} Hundred${rest ? ' ' : ''}` : ''}${rest ? twoDigits(rest) : ''}`;
}

function numberToWordsINR(value: number): string {
  const rupees = Math.floor(Math.abs(value));
  const paise = Math.round((Math.abs(value) - rupees) * 100);
  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';
  let remaining = rupees;
  const crore = Math.floor(remaining / 10000000); remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000); remaining %= 100000;
  const thousand = Math.floor(remaining / 1000); remaining %= 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (remaining) parts.push(threeDigits(remaining));
  let words = `${parts.join(' ') || 'Zero'} Rupees`;
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return `${words} Only`;
}

function formatINR(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(value as string);
  return Number.isFinite(num)
    ? num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value);
}

export default function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/invoices/public/${token}/json`)
      .then(res => setInvoice(res.data.invoice))
      .catch(err => setError(err.response?.data?.message || 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (invoice) {
      const name = (invoice.memberName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      let date = '';
      try {
        date = invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      } catch (e) {
        date = String(invoice.date || '').slice(0, 10) || 'no-date';
      }
      document.title = `invoice_${name}_${date}`;
    }
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f6f8' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" variant="filled">{error || 'Invoice not found'}</Alert>
      </Container>
    );
  }

  const { organization: org, lineItems } = invoice;
  const taxIncluded = invoice.taxIncluded;
  const taxLabel = taxIncluded ? 'GST included' : 'GST added';
  const totalLabel = taxIncluded ? 'Total (tax included)' : 'Total';
  const badge = statusBadge(invoice.status);
  
  const totalNumeric = parseFloat(invoice.totalAmount as any);
  const amountInWords = Number.isFinite(totalNumeric) ? numberToWordsINR(totalNumeric) : null;

  const subtotal = parseFloat(invoice.subtotal as any) || 0;
  const gstAmount = parseFloat(invoice.gstAmount as any) || 0;

  const isCancelled = invoice.status.toLowerCase() === 'cancelled' || invoice.status.toLowerCase() === 'canceled';

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f6f8', 
      py: { xs: 3, sm: 5 },
      px: { xs: 2, sm: 3 },
      color: '#172033',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      '& *': { boxSizing: 'border-box' },
      '@media print': {
        bgcolor: '#fff',
        py: 0,
        px: 0,
      }
    }}>
      <Box className="sheet" sx={{
        maxWidth: '800px',
        margin: 'auto',
        background: '#fff',
        padding: { xs: '24px 18px', sm: '40px' },
        borderRadius: { xs: '10px', sm: '14px' },
        boxShadow: '0 8px 30px rgba(23,32,51,.09)',
        '@media print': {
          boxShadow: 'none',
          borderRadius: 0,
          maxWidth: '100%',
          padding: '16mm',
        }
      }}>
        {/* Header */}
        <Box component="header" sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: '24px',
          borderBottom: '2px solid #172033',
          paddingBottom: '24px'
        }}>
          <Box className="org">
            <Typography component="h1" sx={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 'bold' }}>
              {org.name}
            </Typography>
            <Typography sx={{ color: '#667085', margin: '2px 0' }}>
              {org.address} {org.city}
            </Typography>
            {org.gstNumber && (
              <Typography sx={{ color: '#667085', margin: '2px 0' }}>
                GSTIN: {org.gstNumber}
              </Typography>
            )}
          </Box>
          
          <Box className="meta" sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography component="h2" sx={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>
              Invoice {invoice.invoiceNumber}
            </Typography>
            <Typography sx={{ color: '#667085', margin: '2px 0' }}>
              Issued {new Date(invoice.createdAt || invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Typography>
            <Box 
              component="span" 
              sx={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'capitalize',
                marginTop: '6px',
                color: badge.color,
                backgroundColor: badge.bg,
                textDecoration: isCancelled ? 'line-through' : 'none'
              }}
            >
              {badge.label}
            </Box>
          </Box>
        </Box>

        {/* Bill to */}
        <Box component="section" sx={{ marginTop: '28px' }}>
          <Typography component="h2" sx={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 'bold' }}>
            Bill to
          </Typography>
          <Typography sx={{ margin: '2px 0' }}>
            {invoice.memberName || 'Walk-in customer'}
          </Typography>
        </Box>

        {/* Tax Note */}
        {taxIncluded && (
          <Box sx={{
            background: '#eef7f1',
            color: '#17663a',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            marginTop: '20px',
            margin: '2px 0'
          }}>
            GST is included in the prices shown below.
          </Box>
        )}

        {/* Table */}
        <Box sx={{
          width: '100%',
          margin: '28px 0',
          '@media (max-width: 640px)': {
            display: 'block'
          }
        }}>
          <Box 
            component="table" 
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              '& th, & td': {
                textAlign: 'left',
                padding: '12px 10px',
                borderBottom: '1px solid #e6e8ec',
                verticalAlign: 'top',
              },
              '& th': {
                textTransform: 'uppercase',
                fontSize: '11px',
                letterSpacing: '.04em',
                color: '#667085',
              },
              '& td:nth-of-type(2), & td:nth-of-type(3), & td:nth-of-type(4), & th:nth-of-type(2), & th:nth-of-type(3), & th:nth-of-type(4)': {
                textAlign: 'right',
                whiteSpace: 'nowrap'
              },
              '@media (max-width: 640px)': {
                display: 'block',
                '& thead': { display: 'none' },
                '& tbody': { display: 'block' },
                '& tr': {
                  display: 'block',
                  border: '1px solid #e6e8ec',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '10px'
                },
                '& td': {
                  display: 'block',
                  border: 'none',
                  padding: '4px 0'
                },
                '& td:first-of-type': {
                  paddingBottom: '8px'
                },
                '& td:not(:first-of-type)': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  whiteSpace: 'normal',
                  textAlign: 'right'
                },
                '& td:not(:first-of-type)::before': {
                  content: 'attr(data-label)',
                  color: '#667085',
                  fontWeight: 500,
                  textAlign: 'left'
                }
              }
            }}
          >
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit price{taxIncluded ? ' (incl. GST)' : ''}</th>
                <th>Total{taxIncluded ? ' (incl. GST)' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <Box sx={{ fontWeight: 500 }}>{item.description}</Box>
                    <Box sx={{ color: '#667085', fontSize: '13px' }}>
                      GST {Number(item.gstPercent)}% {taxLabel.toLowerCase()}
                    </Box>
                  </td>
                  <td data-label="Qty">{item.quantity}</td>
                  <td data-label={`Unit price${taxIncluded ? ' (incl. GST)' : ''}`}>Rs. {formatINR(item.unitPrice)}</td>
                  <td data-label={`Total${taxIncluded ? ' (incl. GST)' : ''}`}>Rs. {formatINR(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        {/* Totals */}
        <Box component="section" sx={{
          marginLeft: 'auto',
          width: { xs: '100%', sm: '300px' },
          '& > div': {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 0',
            fontSize: '14px'
          }
        }}>
          <div>
            <span>Taxable amount</span>
            <span>Rs. {formatINR(subtotal)}</span>
          </div>
          <div>
            <span>GST{taxIncluded ? ' (included)' : ''}</span>
            <span>Rs. {formatINR(gstAmount)}</span>
          </div>
          <div style={{
            fontSize: '19px',
            fontWeight: 700,
            borderTop: '2px solid #172033',
            paddingTop: '12px',
            marginTop: '8px'
          }}>
            <span>{totalLabel}</span>
            <span>Rs. {formatINR(totalNumeric)}</span>
          </div>
        </Box>

        {/* Words */}
        {amountInWords && (
          <Typography sx={{
            marginTop: '14px',
            fontSize: '13px',
            color: '#667085',
            fontStyle: 'italic'
          }}>
            Amount in words: {amountInWords}
          </Typography>
        )}

        {/* Actions */}
        <Box className="no-print" sx={{ textAlign: 'right', marginTop: '24px', '@media print': { display: 'none' } }}>
          <Button 
            onClick={handlePrint}
            startIcon={<PrintRoundedIcon />}
            sx={{
              background: '#2f5fda',
              color: '#fff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                background: '#254db3'
              }
            }}
          >
            Print / Save as PDF
          </Button>
        </Box>

        {/* Footer */}
        {invoice.footer && (
          <Box component="footer" sx={{
            borderTop: '1px solid #e6e8ec',
            paddingTop: '18px',
            marginTop: '36px',
            whiteSpace: 'pre-line',
            fontSize: '13px',
            color: '#667085'
          }}>
            {invoice.footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}
