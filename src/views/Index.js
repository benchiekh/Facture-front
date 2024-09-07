import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, CardTitle, Spinner, Button, Badge, CardHeader, Progress, Table } from "reactstrap";

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



  const filteredStandardInvoices = invoices.filter((invoice) => {
    return (
      invoice?.type === 'Standard' && invoice?.currency?._id === selectedCurrency?._id

    );
  });
  const filteredInvoicesByStatus = (status) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice?.type === 'Standard' &&
        invoice?.status === status &&
        invoiceDate.getMonth() + 1 === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice?.currency?._id === selectedCurrency?._id
      );
    });
  };
  const filteredInvoicesByPaymentStatus = (status) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoice?.type === 'Standard' &&
        invoice?.paymentStatus === status &&
        invoiceDate.getMonth() + 1 === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice?.currency?._id === selectedCurrency?._id
      );
    });
  };
  const Paymentstatuspercentage = (status) => {
    if (!selectedCurrency || filteredStandardInvoices.length === 0) {
      return 0;
    }

    const filteredInvoices = filteredInvoicesByPaymentStatus(status);

    const percentage = (filteredInvoices.length / filteredStandardInvoices.length) * 100;

    return Math.round(percentage);
  };


  const Draftstatuspercentage = (status) => {
    if (!selectedCurrency || filteredStandardInvoices.length === 0) {
      return 0;
    }

    const filteredInvoices = filteredInvoicesByStatus(status);

    const percentage = (filteredInvoices.length / filteredStandardInvoices.length) * 100;

    return Math.round(percentage);
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
        const x = Draftstatuspercentage();
        console.log(x)
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
      <Container className="mt--7" fluid>
        {/* Second Row */}
        <Row className="mt-4">
          <Col lg="8">
            <Row>
              <Col lg="6">
                <Card className="shadow">
                  <CardHeader>
                    <h6>Factures</h6>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Brouillon</div>
                        <div className="text-dark font-weight-bold">{Draftstatuspercentage('Brouillon')}%</div>
                      </div>
                      <Progress color="dark" value={Draftstatuspercentage('Brouillon')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>En Attente</div>
                        <div className="text-dark font-weight-bold">{Draftstatuspercentage('En attente')}%</div>
                      </div>
                      <Progress color="secondary" value={Draftstatuspercentage('En attente')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Impayé</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Unpaid')}%</div>
                      </div>
                      <Progress color="warning" value={Paymentstatuspercentage('Unpaid')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>En Retard</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Retard')}%</div>
                      </div>
                      <Progress color="danger" value={Paymentstatuspercentage('Retard')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Partiellement</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Partially Paid')}%</div>
                      </div>
                      <Progress color="info" value={Paymentstatuspercentage('Partially Paid')} className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Payé</div>
                        <div className="text-dark font-weight-bold">{Paymentstatuspercentage('Paid')}%</div>
                      </div>
                      <Progress color="success" value={Paymentstatuspercentage('Paid')} />
                    </div>
                  </CardHeader>
                </Card>
              </Col>

              <Col lg="6">
                <Card className="shadow">
                  <CardHeader>
                    <h6>Factures Proforma</h6>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Brouillon</div>
                        <div className="text-dark font-weight-bold">50%</div>
                      </div>
                      <Progress color="dark" value="50" className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>En Attente</div>
                        <div className="text-dark font-weight-bold">0%</div>
                      </div>
                      <Progress color="secondary" value="0" className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Envoyé</div>
                        <div className="text-dark font-weight-bold">0%</div>
                      </div>
                      <Progress color="info" value="0" className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Refusé</div>
                        <div className="text-dark font-weight-bold">0%</div>
                      </div>
                      <Progress color="danger" value="0" className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Accepté</div>
                        <div className="text-dark font-weight-bold">50%</div>
                      </div>
                      <Progress color="success" value="50" className="mb-3" />

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>Expiré</div>
                        <div className="text-dark font-weight-bold">0%</div>
                      </div>
                      <Progress color="warning" value="0" />
                    </div>
                  </CardHeader>
                </Card>
              </Col>


            </Row>
          </Col>

          <Col lg="4">
            <Card className="shadow">
              <CardHeader>
                <h6>Clients</h6>
                <div className="text-center">
                  <div className="display-3">0%</div>
                  <p>Nouveau client ce mois-ci</p>
                  <div style={{ color: "#40c57d" }}>
                    <i className="ni ni-bold-up"></i> 100.00%
                  </div>
                  <p>Client actif</p>
                </div>
              </CardHeader>
            </Card>
          </Col>
        </Row>


        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Page visits</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Page name</th>
                    <th scope="col">Visitors</th>
                    <th scope="col">Unique users</th>
                    <th scope="col">Bounce rate</th>
                    <th scope="col">Bounce rate</th>

                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">/argon/</th>
                    <td>4,569</td>
                    <td>340</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/index.html</th>
                    <td>3,985</td>
                    <td>319</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/charts.html</th>
                    <td>3,513</td>
                    <td>294</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      36,49%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/tables.html</th>
                    <td>2,050</td>
                    <td>147</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 50,87%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/profile.html</th>
                    <td>1,795</td>
                    <td>190</td>
                    <td>
                      <i className="fas fa-arrow-down text-danger mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Social traffic</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Referral</th>
                    <th scope="col">Visitors</th>
                    <th scope="col">Bounce rate</th>
                    <th scope="col">Bounce rate</th>
                    <th scope="col">Bounce rate</th>

                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>1,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">60%</span>
                        <div>
                          <Progress
                            max="100"
                            value="60"
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>5,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">70%</span>
                        <div>
                          <Progress
                            max="100"
                            value="70"
                            barClassName="bg-gradient-success"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Google</th>
                    <td>4,807</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">80%</span>
                        <div>
                          <Progress max="100" value="80" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Instagram</th>
                    <td>3,678</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">75%</span>
                        <div>
                          <Progress
                            max="100"
                            value="75"
                            barClassName="bg-gradient-info"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">twitter</th>
                    <td>2,645</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">30%</span>
                        <div>
                          <Progress
                            max="100"
                            value="30"
                            barClassName="bg-gradient-warning"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;
