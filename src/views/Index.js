import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, CardTitle, Spinner, Button, Badge } from "reactstrap";

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const Index = () => {
  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [totalProforma, setTotalProforma] = useState(0);
  const [loadingPaid, setLoadingPaid] = useState(false);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [loadingProforma, setLoadingProforma] = useState(false);
  const [payments, setPayments] = useState(false);
  const currentMonth = new Date().getMonth() + 1; 
  const currentYear = new Date().getFullYear();
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [invoices, setInvoices] = useState([]);


  const fetchCurrencies = async () => {
    try {
      const currencyResponse = await axios.get("http://localhost:5000/api/currency", {
        params: { createdBy: currentUserId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrencies(currencyResponse.data.filter(currency => currency.active));
      
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoices/${currentUserId}`, {
        params: {
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        }
      });

      const invoicesData = response.data;
      setInvoices(invoicesData);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const totalUnpaidAmount = invoicesData
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date); 
          return (
            invoice?.type === 'Standard' &&
            invoice?.paymentStatus === "Unpaid" &&
            invoice?.currency?._id === selectedCurrency?._id &&
            invoiceDate.getMonth() + 1 === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          );
        })
        .reduce((total, invoice) => total + invoice.total, 0); 

      setTotalUnpaid(totalUnpaidAmount);

      const totalProformaAmount = invoicesData
        .filter(invoice => {
          const invoiceDate = new Date(invoice.date); 
          return (
            invoice?.type === 'Proforma' &&
            invoice?.currency?._id === selectedCurrency?._id &&
            invoiceDate.getMonth() + 1 === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          );
        })
        .reduce((total, invoice) => total + invoice.total, 0); 

      setTotalProforma(totalProformaAmount);

    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };



  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (invoice?.type === 'Standard' || invoice?.isConverted === true) && invoice?.paymentStatus === "Paid"
    );
  });




  //console.log("all",invoices)
  //console.log("filtred",filteredInvoices)

  const getCurrencyByInvoiceId = (id) => {
    const invoice = filteredInvoices.find(invoice => invoice._id === id);
    if (!invoice || !invoice.currency) {
      return null;
    }
    console.log(invoice.currency); 
    return invoice.currency._id;
  };


  const fetchPayment = async () => {
    try {
      const paymentResponse = await axios.get(`http://localhost:5000/api/payments/createdBy/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentsThisMonth = paymentResponse.data.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return (
          paymentDate.getMonth() + 1 === currentMonth &&
          paymentDate.getFullYear() === currentYear
        );
      });
      const paymentsByCurrency = paymentsThisMonth.reduce((acc, payment) => {
        const currencyId = getCurrencyByInvoiceId(payment.invoice);

        if (!currencyId) {
          return acc;
        }

        const paymentAmount = payment.amountPaid;
        if (!acc[currencyId]) {
          acc[currencyId] = 0;
        }
        acc[currencyId] += paymentAmount;

        return acc;
      }, {});

      console.log('Payments by Currency:', paymentsByCurrency);
      setPayments(paymentsByCurrency);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };






  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
  };

  const getCurrencySymbolById = (id, price) => {
    const numericPrice = Number(price);

    if (isNaN(numericPrice)) {
      return 'Invalid amount';
    }

    const currency = currencies.find(c => c._id === id);
    if (!currency) return numericPrice.toFixed(2);

    return `${currency.symbol} ${numericPrice.toFixed(2)}`;
  };

  const toggleCurrencyDropdown = () => setCurrencyDropdownOpen(!currencyDropdownOpen);

  useEffect(() => {
    fetchInvoices();
    fetchCurrencies();
    fetchPayment();
  }, [selectedCurrency]);




  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <Row className="mb-4">
            <Col lg="12" className="mb-4 d-flex justify-content-end">
              <Dropdown
                isOpen={currencyDropdownOpen}
                toggle={toggleCurrencyDropdown}
              >
                <DropdownToggle caret>
                  {selectedCurrency ? selectedCurrency.name : "Select Currency"}
                </DropdownToggle>
                <DropdownMenu>
                  {currencies.map(currency => (
                    <DropdownItem key={currency._id} onClick={() => handleCurrencySelect(currency)}>
                      {currency.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>

          <span className="h2 font-weight-bold mb-0">
            {selectedCurrency && payments[selectedCurrency._id] !== undefined
              ? getCurrencySymbolById(selectedCurrency._id, payments[selectedCurrency._id])
              : "0.00"}
          </span>


          <div className="header-body">
            <Row>
              {/* Paid Invoices Card */}
              <Col lg="6" xl="4">

                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Paid Invoices
                        </CardTitle>

                        <Badge color="success" style={{ fontSize: "20px" }}>


                          {selectedCurrency && payments[selectedCurrency._id] !== undefined
                            ? getCurrencySymbolById(selectedCurrency._id, payments[selectedCurrency._id])
                            : "0.00"}


                        </Badge>

                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                          <i className="fas fa-check-circle" />
                        </div>
                      </Col>
                    </Row>

                  </CardBody>
                </Card>
              </Col>

              {/* Unpaid Invoices Card */}
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Unpaid Invoices
                        </CardTitle>
                        <Badge color="danger" style={{ fontSize: "20px" }}>
                          {selectedCurrency ? getCurrencySymbolById(selectedCurrency._id, totalUnpaid) : "0.00"}
                        </Badge>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-times-circle" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>

              {/* Proforma Invoices Card */}
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                          Proforma Invoices
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {loadingProforma ? (
                            <Spinner size="sm" color="primary" />
                          ) : (
                            getCurrencySymbolById(selectedCurrency?._id, totalProforma)
                          )}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-file-invoice" />
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default Index;
