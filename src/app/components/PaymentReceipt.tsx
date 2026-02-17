import React, { useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReceiptProps {
    payment: any;
    onClose?: () => void;
}

const PaymentReceipt: React.FC<ReceiptProps> = ({ payment, onClose }) => {
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt-${payment.receipt_number || payment.reference_number}`,
    });

    const handleDownloadPDF = async () => {
        const element = componentRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Receipt-${payment.receipt_number || payment.reference_number}.pdf`);
    };

    if (!payment) return null;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3, '@media print': { display: 'none' } }}>
                <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
                    Print
                </Button>
                <Button variant="contained" startIcon={<Download />} onClick={handleDownloadPDF}>
                    Download PDF
                </Button>
            </Box>

            {/* Trust Badge / Watermark logic could go here */}

            <Paper
                ref={componentRef}
                elevation={3}
                sx={{
                    p: 5,
                    maxWidth: '800px',
                    mx: 'auto',
                    bgcolor: 'white',
                    color: 'black',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                id="receipt-content"
            >
                {/* Watermark */}
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-45deg)',
                    opacity: 0.05,
                    fontSize: '100px',
                    fontWeight: 'bold',
                    color: 'grey.500',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 0
                }}>
                    {payment.status === 'completed' ? 'PAID' : 'PENDING'}
                </Box>

                {/* Header */}
                <Grid container spacing={2} sx={{ mb: 4, position: 'relative', zIndex: 1 }}>
                    <Grid item xs={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Logo Placeholder */}
                            <Box sx={{ width: 60, height: 60, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                                GT
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" color="primary.main">
                                    GARDEN TVET SCHOOL
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Kigali, Rwanda | +250 788 123 456
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    info@gardentvet.ac.rw | www.gardentvet.ac.rw
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.secondary', letterSpacing: 2 }}>
                            RECEIPT
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Date: {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.5 }}>
                            #{payment.receipt_number || payment.reference_number}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 4, borderColor: 'primary.main', borderWidth: 1 }} />

                {/* Bill To & Payment Info */}
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            RECEIVED FROM
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {payment.parent_name || 'Parent / Guardian'}
                        </Typography>
                        <Typography variant="body1">
                            Phone: {payment.parent_phone || payment.mobile_number}
                        </Typography>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                STUDENT DETAILS
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {payment.student_name}
                            </Typography>
                            <Typography variant="body1">
                                Code: {payment.student_code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Trade: {payment.trade_code} | Level: {payment.level}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            PAYMENT METHOD
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                label={payment.payment_method?.replace('_', ' ').toUpperCase()}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        </Box>
                        <Typography variant="body2">
                            Ref: {payment.gateway_reference || payment.reference_number}
                        </Typography>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, display: 'inline-block', textAlign: 'right', minWidth: '200px' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                AMOUNT PAID
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                {parseInt(payment.amount).toLocaleString()} RWF
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Status: <span style={{ color: payment.status === 'completed' ? 'green' : 'orange', fontWeight: 'bold' }}>{payment.status.toUpperCase()}</span>
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Transaction Details Table */}
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    TRANSACTION DETAILS
                </Typography>
                <Table size="small" sx={{ mb: 4 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell align="center"><strong>Term</strong></TableCell>
                            <TableCell align="center"><strong>Academic Year</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{payment.description || 'School Fees Payment'}</TableCell>
                            <TableCell align="center">Term {payment.term}</TableCell>
                            <TableCell align="center">{payment.academic_year}</TableCell>
                            <TableCell align="right">{parseInt(payment.amount).toLocaleString()} RWF</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {/* Footer */}
                <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Thank you for your payment. This is a computer-generated receipt and requires no signature.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Garden TVET School Management System | Generated on {new Date().toLocaleString()}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default PaymentReceipt;
