import React, { useState, useContext, useEffect } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";

const Booking = ({ tour, avgRating }) => {
  const { price, reviews, title } = tour;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const today = new Date()
  const formattedDate = today.toISOString().split('T')[0]

  function containsSpecialChars(str) {
    const specialChars =
      /[`0123456789!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
  }

  const [booking, setBooking] = useState({
    userId: user && user._id,
    tourId: id,
    userEmail: user && user.email,
    tourName: title,
    fullName: "",
    phone: "",
    guestSize: 1,
    bookAt: "",
  });

  const handleChange = (e) => {
    switch (e.target.id) {
      case 'fullName':
        if (containsSpecialChars(e.target.value))
          alert("Full name must not contain any special characters or digits!")
        else
          setBooking((prev) => ({ ...prev, [e.target.id]: e.target.value }))
        break
      case 'phone':
        if (e.target.value.length > 11)
          alert("Phone number must be of 11 digits!")
        else
          setBooking((prev) => ({ ...prev, [e.target.id]: e.target.value }))
        break
      case 'bookAt':
        setBooking((prev) => ({ ...prev, [e.target.id]: e.target.value }))
        break
      case 'guestSize':
        setBooking((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    }
  };

  const serviceFee = 10;
  const totalAmount =
    Number(price) * Number(booking.guestSize) + Number(serviceFee);

  const bookGuide = async () => {
    try {
      if (!user || user === undefined || user === null) {
        return alert("please sign in");
      }
      console.log(booking.fullName)
      if (booking.fullName === "" || booking.bookAt === "" || booking.phone === "" || booking.guestSize === "")
        return alert("All fields are required!")
      if (containsSpecialChars(booking.fullName))
        return alert("Full name must not contain any special characters or digits!")
      if (booking.phone.length != 11)
        return alert("Phone number must be of 11 digits!")
      if (booking.guestSize <= 0)
        return alert("Guest Size must be a positive number!")
      if (booking.guestSize > 20)
        return alert("Sorry, maximum number of guests allowed is 20 :(")

      toast({
        title: "We Recieved Your Request!",
        description: "Please wait for the confirmation.",
        status: "info",
        duration: 9000,
        isClosable: true,
      });
      fetch(`${BASE_URL}/booking`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(booking),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log(data);
          navigate(`/payment/${data.data._id}`);
        });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="booking">
      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>
          ${price} <span>/person</span>
        </h3>
        <span className="tour__rating d-flex alignt-items center">
          <i className="ri-star-fill"></i>
          {avgRating === 0 ? null : avgRating} ({reviews?.length})
        </span>
      </div>

      {/* ============= booking form start ============= */}
      <div className="booking__form">
        <h5>Information</h5>
        <Form className="booking__info-form">
          <FormGroup>
            <input
              type="text"
              placeholder="Full Name"
              id="fullName"
              required
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <input
              type="number"
              placeholder="Phone"
              id="phone"
              required
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input
              type="date"
              placeholder=""
              id="bookAt"
              min={formattedDate}
              required
              onChange={handleChange}
            />
            <input
              type="number"
              placeholder="Number of visitors"
              id="guestSize"
              required
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </div>
      {/* ============= booking form end ============= */}

      {/* ============= booking bottom ============= */}
      <div className="booking__bottom">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              ${price} <i className="ri-close-line"></i> 1 person
            </h5>
            <span> ${price}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0">
            <h5>Service charge</h5>
            <span> ${serviceFee}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0 total">
            <h5>Total</h5>
            <span> ${totalAmount}</span>
          </ListGroupItem>
        </ListGroup>

        <Button className="btn primary__btn w-100 mt-4" onClick={bookGuide}>
          Book now
        </Button>
      </div>
    </div>
  );
};

export default Booking;
