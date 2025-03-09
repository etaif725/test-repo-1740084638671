import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { motion } from 'framer-motion';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import LockIcon from '@mui/icons-material/Lock';
import PaidIcon from '@mui/icons-material/Paid';
import { Client, ClientFormData, Plan } from '../../types/agency';
import { useAuth } from '../../hooks/use-auth';
import { dashboardService } from '../../services/dashboardServices';
import { agencyService } from '@/types/types';

const ClientManagement: React.FC = () => {
  const theme = useTheme();
  const { token, dashboardId } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [relieveClientId, setRelieveClientId] = useState<string | null>(null);
  const [relieveLoading, setRelieveLoading] = useState(false);
  const [openClientDetail, setOpenClientDetail] = useState(false);
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone_number: '',
    company: '',
    plan_id: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await agencyService.getAgencyPlans(token, dashboardId);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else if (formData.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
      isValid = false;
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
      isValid = false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    } else if (formData.email.length > 254) {
      errors.email = 'Email cannot exceed 254 characters';
      isValid = false;
    }

    if (formData.phone_number.trim() && !/^\+?[\d\s-()]{10,15}$/.test(formData.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number (10-15 digits with optional +, spaces, or hyphens)';
      isValid = false;
    }

    if (!formData.company.trim()) {
      errors.company = 'Business name is required';
      isValid = false;
    } else if (formData.company.length < 2) {
      errors.company = 'Business name must be at least 2 characters';
      isValid = false;
    } else if (formData.company.length > 100) {
      errors.company = 'Business name cannot exceed 100 characters';
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s\-'&\.]+$/.test(formData.company)) {
      errors.company = 'Business name can only contain letters, numbers, spaces, hyphens, apostrophes, ampersands, and periods';
      isValid = false;
    }

    if (!formData.plan_id) {
      errors.plan_id = 'Please select a plan';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else {
      const requirements = [];
      if (formData.password.length < 8) requirements.push('at least 8 characters');
      if (formData.password.length > 128) requirements.push('no more than 128 characters');
      if (!/[A-Z]/.test(formData.password)) requirements.push('one uppercase letter');
      if (!/[a-z]/.test(formData.password)) requirements.push('one lowercase letter');
      if (!/\d/.test(formData.password)) requirements.push('one number');
      if (!/[^A-Za-z0-9]/.test(formData.password)) requirements.push('one special character');
      
      if (/\s/.test(formData.password)) {
        errors.password = 'Password cannot contain spaces';
        isValid = false;
      } else if (requirements.length > 0) {
        errors.password = `Password must contain ${requirements.join(', ')}`;
        isValid = false;
      }

      const commonPatterns = [
        /^[a-zA-Z]+$/, /^[0-9]+$/, /^[!@#$%^&*]+$/, 
        /^qwerty/i, /^password/i, /^admin/i, /12345/
      ];
      
      if (commonPatterns.some(pattern => pattern.test(formData.password))) {
        errors.password = 'Password is too common or simple. Please use a more complex combination';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateClient = async () => {
    if (validateForm()) {
      try {
        setSubmitting(true);
        setError(null);

        const clientData = {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          business_name: formData.company,
          company: formData.company,
          plan_id: formData.plan_id,
          password: formData.password
        };

        await agencyService.createClient(clientData, token, dashboardId);

        setSuccessMessage('Client created successfully');
        setShowAddClientModal(false);
        fetchClients();
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          company: '',
          plan_id: '',
          password: ''
        });
      } catch (err: any) {
        console.error('Error creating client:', err);
        
        if (err.response?.data?.details?.code === 'ER_DUP_ENTRY' && 
            err.response?.data?.details?.sqlMessage?.includes('uk_email')) {
          setError('A user with this email address already exists. Please use a different email address.');
        } else {
          setError(err.response?.data?.error || err.message || 'Failed to create client');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await agencyService.getAgencyClients(token, dashboardId);
      setClients(response.data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleRelieveClient = async (clientId: string) => {
    try {
      setRelieveLoading(true);
      setError(null);

      await agencyService.relieveClient(clientId, token, dashboardId);
      
      setSuccessMessage('Client successfully relieved from agency management');
      setRelieveClientId(null);
      fetchClients();
    } catch (err: any) {
      console.error('Error relieving client:', err);
      setError(err.response?.data?.error || err.message || 'Failed to relieve client');
    } finally {
      setRelieveLoading(false);
    }
  };

  const handleOpenClientDetail = (clientId: string) => {
    setSelectedClientId(clientId);
    setOpenClientDetail(true);
  };

  return (
    <>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          width: '100%',
          minHeight: '100vh',
          background: (theme) => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: theme => theme.spacing(1),
            height: theme => theme.spacing(1),
            backgroundColor: theme => alpha(theme.palette.background.paper, 0.8),
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme => alpha(theme.palette.background.paper, 0.8),
            borderRadius: theme => theme.spacing(0.5),
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.5),
            borderRadius: theme => theme.spacing(0.5),
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.7),
            },
          },
        }}
      >
        <Box
          sx={{
            width: '92%',
            maxWidth: '1400px',
            margin: '0 auto',
            py: 4,
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                }}
              >
                <BusinessIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    mb: 0.5,
                  }}
                >
                  Client Management
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha(theme.palette.text.secondary, 0.8),
                    maxWidth: '600px',
                  }}
                >
                  Manage your agency clients, their access, and monitor their status
                </Typography>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setShowAddClientModal(true)}
              sx={{
                background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0062CC, #4744AB)',
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25)',
                },
              }}
            >
              Add New Client
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: theme => theme.spacing(3),
              borderRadius: theme => theme.spacing(2),
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.85)})`,
              backdropFilter: 'blur(20px)',
              border: theme => `${theme.spacing(0.125)} solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                onClose={() => setSuccessMessage(null)}
              >
                {successMessage}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : clients.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  px: 3,
                  textAlign: 'center',
                  background: theme => alpha(theme.palette.background.paper, 0.6),
                  borderRadius: theme => theme.shape.borderRadius * 2,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <BusinessIcon
                  sx={{
                    fontSize: 64,
                    mb: 2,
                    color: theme => alpha(theme.palette.primary.main, 0.5),
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                  }}
                >
                  No Clients Yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                    maxWidth: 400,
                  }}
                >
                  Get started by adding your first client. You can manage their access, monitor their usage, and configure their dashboards all in one place.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowAddClientModal(true)}
                  sx={{
                    background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: theme => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.85)})`,
                    },
                  }}
                >
                  Add First Client
                </Button>
              </Box>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {clients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Paper elevation={0}>
                      <Box
                        sx={{
                          p: theme => theme.spacing(3),
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme => theme.spacing(2),
                          cursor: 'pointer',
                          transition: theme => theme.transitions.create(['background-color'], {
                            duration: theme.transitions.duration.shorter,
                          }),
                        }}
                        onClick={() => handleOpenClientDetail(client.id)}
                      >
                        <Box
                          sx={{
                            width: theme => theme.spacing(6),
                            height: theme => theme.spacing(6),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: theme => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            color: 'common.white',
                            borderRadius: '50%',
                            boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: theme => theme.typography.pxToRem(24) }} />
                        </Box>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {client.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            {(client.company || client.business_name) && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <BusinessIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                {client.business_name || client.company}
                              </Typography>
                            )}
                            
                            {client.email && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <EmailIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                {client.email}
                              </Typography>
                            )}
                            
                            {client.phone_number && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                <PhoneIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                {client.phone_number}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip
                              label={client.status || 'Active'}
                              size="small"
                              sx={{
                                bgcolor: client.status?.toLowerCase() === 'active' 
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : alpha(theme.palette.error.main, 0.1),
                                color: client.status?.toLowerCase() === 'active'
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                                fontWeight: 500,
                                '& .MuiChip-label': {
                                  px: 1,
                                },
                              }}
                            />
                            
                            {client.subscription?.plan_name && (
                              <Chip
                                label={client.subscription.plan_name}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 500,
                                  '& .MuiChip-label': {
                                    px: 1,
                                  },
                                }}
                              />
                            )}
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenClientDetail(client.id)}
                              sx={{
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                },
                                '&:focus': {
                                  outline: 'none',
                                },
                                minWidth: '120px',
                              }}
                            >
                              Manage Client
                            </Button>
                            
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setRelieveClientId(client.id)}
                              startIcon={<RemoveCircleIcon />}
                              sx={{
                                borderColor: alpha(theme.palette.error.main, 0.3),
                                color: theme.palette.error.main,
                                '&:hover': {
                                  borderColor: theme.palette.error.main,
                                  bgcolor: alpha(theme.palette.error.main, 0.04),
                                },
                                '&:focus': {
                                  outline: 'none',
                                },
                              }}
                            >
                              Relieve Client
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Paper>
        </Box>

        {/* Add Client Modal */}
        <Dialog
          open={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              backdropFilter: 'blur(20px)',
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              pt: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
              }}
            >
              <PersonAddIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography
              variant="body1"
              sx={{
                background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 600,
              }}
            >
              Create New Client
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ px: 4, py: 3 }}>
            <Stack spacing={4}>
              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError(null)}
                  sx={{
                    '& .MuiAlert-message': {
                      width: '100%',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}
              
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.02em',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                  Client Details
                </Typography>
                
                <Stack spacing={2.5}>
                  <TextField
                    name="name"
                    label="Client Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.email}
                    helperText={formErrors.email || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    name="phone_number"
                    label="Phone Number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    fullWidth
                    error={!!formErrors.phone_number}
                    helperText={formErrors.phone_number || 'Optional'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                </Stack>
              </Box>
              
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.02em',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                  Business Details
                </Typography>
                
                <Stack spacing={2.5}>
                  <TextField
                    name="company"
                    label="Business Name"
                    value={formData.company}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.company}
                    helperText={formErrors.company || ''}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                  
                  <TextField
                    name="password"
                    label="Client Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    error={!!formErrors.password}
                    helperText={formErrors.password || 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                          },
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      },
                    }}
                  />
                </Stack>
              </Box>
              
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    letterSpacing: '0.02em',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <PaidIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                  Subscription Plan
                </Typography>
                
                <FormControl fullWidth required error={!!formErrors.plan_id}>
                  <InputLabel>Select Plan</InputLabel>
                  <Select
                    name="plan_id"
                    value={formData.plan_id}
                    onChange={(event) => {
                      handleInputChange({
                        target: {
                          name: "plan_id",
                          value: event.target.value
                        }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    label="Select Plan"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.divider, 0.2),
                      },
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                      },
                      '&.Mui-focused': {
                        backgroundColor: alpha(theme.palette.background.paper, 0.7),
                      },
                    }}
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price_per_month}/month
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.plan_id && (
                    <FormHelperText error>{formErrors.plan_id}</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Stack>
          </DialogContent>
          
          <DialogActions
            sx={{
              px: 4,
              pb: 4,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Button
              onClick={() => setShowAddClientModal(false)}
              disabled={submitting}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                },
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleCreateClient}
              variant="contained"
              disabled={
                submitting ||
                !formData.name ||
                !formData.email ||
                !formData.company ||
                !formData.plan_id ||
                !formData.password
              }
              startIcon={submitting ? <CircularProgress size={20} /> : null}
              sx={{
                background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.dark, 0.85)})`,
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
              }}
            >
              {submitting ? 'Creating...' : 'Create Client'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Client Detail Dialog */}
        <Dialog
          open={openClientDetail}
          onClose={() => setOpenClientDetail(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              backdropFilter: 'blur(20px)',
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            },
          }}
        >
          {selectedClientId && clients.find(c => c.id === selectedClientId) && (
            <>
              <DialogTitle
                sx={{
                  pb: 1,
                  pt: 3,
                  px: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                  }}
                >
                  <BusinessIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  {clients.find(c => c.id === selectedClientId)?.name} - Client Details
                </Typography>
              </DialogTitle>
              
              <DialogContent sx={{ px: 4, py: 3 }}>
                {(() => {
                  const client = clients.find(c => c.id === selectedClientId);
                  if (!client) return null;
                  
                  return (
                    <Stack spacing={4}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1.5,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.02em',
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <PersonAddIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                          Contact Information
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 3,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1">{client.name}</Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Email Address
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5
                              }}
                            >
                              <EmailIcon fontSize="small" color="action" />
                              {client.email}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Business Name
                            </Typography>
                            <Typography 
                              variant="body1"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5
                              }}
                            >
                              <BusinessIcon fontSize="small" color="action" />
                              {client.business_name || client.company || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Phone Number
                            </Typography>
                            <Typography 
                              variant="body1"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5
                              }}
                            >
                              <PhoneIcon fontSize="small" color="action" />
                              {client.phone_number || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1.5,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.02em',
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <PaidIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                          Subscription Details
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 3,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Current Plan
                            </Typography>
                            <Typography 
                              variant="body1"
                              sx={{
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              <PaidIcon fontSize="small" color="action" />
                              {client.subscription?.plan_name || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Account Status
                            </Typography>
                            <Typography variant="body1">
                              <Chip
                                label={client.status || 'Active'}
                                size="small"
                                sx={{
                                  bgcolor: client.status?.toLowerCase() === 'active' 
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.error.main, 0.1),
                                  color: client.status?.toLowerCase() === 'active'
                                    ? theme.palette.success.main
                                    : theme.palette.error.main,
                                  fontWeight: 500,
                                  '& .MuiChip-label': {
                                    px: 1,
                                  },
                                }}
                              />
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Client Since
                            </Typography>
                            <Typography variant="body1">
                              {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Next Billing
                            </Typography>
                            <Typography variant="body1">
                              {client.subscription?.next_billing_date 
                                ? new Date(client.subscription.next_billing_date).toLocaleDateString() 
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1.5,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            letterSpacing: '0.02em',
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <LockIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                          Access Management
                        </Typography>
                        
                        <Box sx={{ 
                          p: 2,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}>
                          <Stack spacing={2}>
                            <Button
                              variant="outlined"
                              startIcon={<LockIcon />}
                              fullWidth
                              sx={{
                                justifyContent: 'flex-start',
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              Reset Client Password
                            </Button>
                            
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<RemoveCircleIcon />}
                              fullWidth
                              onClick={() => {
                                setOpenClientDetail(false);
                                setRelieveClientId(client.id);
                              }}
                              sx={{
                                justifyContent: 'flex-start',
                                borderColor: alpha(theme.palette.error.main, 0.3),
                                color: theme.palette.error.main,
                                '&:hover': {
                                  borderColor: theme.palette.error.main,
                                  bgcolor: alpha(theme.palette.error.main, 0.04),
                                },
                              }}
                            >
                              Relieve Client from Agency
                            </Button>
                          </Stack>
                        </Box>
                      </Box>
                    </Stack>
                  );
                })()}
              </DialogContent>
              
              <DialogActions
                sx={{
                  px: 4,
                  pb: 4,
                  pt: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Button
                  onClick={() => setOpenClientDetail(false)}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                    },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Relieve Client Confirmation Dialog */}
        <Dialog
          open={!!relieveClientId}
          onClose={() => setRelieveClientId(null)}
          PaperProps={{
            sx: {
              background: theme => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              backdropFilter: 'blur(20px)',
              boxShadow: theme => `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              pt: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.2)})`,
              }}
            >
              <RemoveCircleIcon sx={{ color: theme.palette.error.main }} />
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            >
              Confirm Client Removal
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ px: 4, py: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to relieve this client from your agency management?
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Client: <strong>{relieveClientId && clients.find(c => c.id === relieveClientId)?.name}</strong>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This will:
            </Typography>
            
            <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Remove this client from your agency dashboard
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                End your access to manage their account
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                The client will maintain their own account access
              </Typography>
              <Typography component="li" variant="body2">
                This action <strong>cannot</strong> be undone
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions
            sx={{
              px: 4,
              pb: 4,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Button
              onClick={() => setRelieveClientId(null)}
              disabled={relieveLoading}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                },
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={() => relieveClientId && handleRelieveClient(relieveClientId)}
              variant="contained"
              color="error"
              disabled={relieveLoading}
              startIcon={relieveLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                background: theme.palette.error.main,
                '&:hover': {
                  background: theme.palette.error.dark,
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: theme => `0 2px 8px ${alpha(theme.palette.error.main, 0.25)}`,
                },
              }}
            >
              {relieveLoading ? 'Processing...' : 'Confirm Removal'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default ClientManagement;