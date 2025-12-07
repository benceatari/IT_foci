document.addEventListener("DOMContentLoaded", () => {
  initFooterYear();
  initMobileNav();
  initDrillsGallery();
  initSignupFormValidation();
});

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function initFooterYear() {
  const yearSpan = $("#year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function initMobileNav() {
  const navToggle = $(".nav-toggle");
  const mainNav = $(".main-nav");

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  $all("a", mainNav).forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
    });
  });
}


function initDrillsGallery() {
  const gallery = $("#drills-gallery");
  if (!gallery) return;

  const items = $all(".gallery-item", gallery);
  const prevBtn = $("[data-gallery-prev]", gallery);
  const nextBtn = $("[data-gallery-next]", gallery);

  if (!items.length || !prevBtn || !nextBtn) return;

  let index = 0;

  function showSlide(i) {
    items.forEach((img, idx) => {
      img.classList.toggle("active", idx === i);
    });
  }

  function goPrev() {
    index = (index - 1 + items.length) % items.length;
    showSlide(index);
  }

  function goNext() {
    index = (index + 1) % items.length;
    showSlide(index);
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  document.addEventListener("keydown", (e) => {
    if (!gallery.matches(":hover")) return;
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  showSlide(index);
}

function initSignupFormValidation() {
  const form = $("#signup-form");
  if (!form) return;

  const fields = {
    name: $("#full-name"),
    email: $("#email"),
    phone: $("#phone"),
    age: $("#age"),
    position: $("#fav-position"),
    date: $("#preferred-date"),
    terms: $("#terms"),
  };

  const errorEls = {
    name: $("#err-name"),
    email: $("#err-email"),
    phone: $("#err-phone"),
    age: $("#err-age"),
    position: $("#err-position"),
    date: $("#err-date"),
    level: $("#err-level"),
    terms: $("#err-terms"),
  };

  const levelInputs = $all("input[name='level']", form);
  const successMsg = $("#signup-success");

  function clearErrors() {
    Object.values(errorEls).forEach((el) => {
      if (el) el.textContent = "";
    });

    [
      fields.name,
      fields.email,
      fields.phone,
      fields.age,
      fields.position,
      fields.date,
    ].forEach((input) => input && input.classList.remove("error-field"));

    levelInputs.forEach((input) => input.classList.remove("error-field"));
    if (fields.terms) fields.terms.classList.remove("error-field");

    if (successMsg) successMsg.hidden = true;
  }

  function setError(key, message) {
    const errorEl = errorEls[key];
    const field =
      key === "name"
        ? fields.name
        : key === "email"
        ? fields.email
        : key === "phone"
        ? fields.phone
        : key === "age"
        ? fields.age
        : key === "position"
        ? fields.position
        : key === "date"
        ? fields.date
        : key === "terms"
        ? fields.terms
        : null;

    if (errorEl) errorEl.textContent = message || "";
    if (field && message) field.classList.add("error-field");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    let valid = true;

    const nameVal = fields.name.value.trim();
    if (!nameVal || nameVal.length < 3) {
      setError("name", "Adj meg egy legalább 3 karakteres nevet.");
      valid = false;
    }

    const emailVal = fields.email.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
      setError("email", "Adj meg egy érvényes e-mail címet.");
      valid = false;
    }

    const phoneDigits = fields.phone.value.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 8) {
      setError("phone", "Adj meg egy használható telefonszámot.");
      valid = false;
    }

    const ageVal = Number(fields.age.value);
    if (!fields.age.value || ageVal < 12 || ageVal > 70) {
      setError("age", "Életkor 12 és 70 év között lehet.");
      valid = false;
    }

    if (!fields.position.value) {
      setError("position", "Válaszd ki a posztod.");
      valid = false;
    }

    if (!fields.date.value) {
      setError("date", "Válassz egy dátumot.");
      valid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(fields.date.value);
      if (selected < today) {
        setError("date", "Múltbeli dátumra nem tudsz jelentkezni.");
        valid = false;
      }
    }

    const levelSelected = levelInputs.some((input) => input.checked);
    if (!levelSelected) {
      if (errorEls.level) {
        errorEls.level.textContent = "Válaszd ki a játékos-szinted.";
      }
      levelInputs.forEach((input) => input.classList.add("error-field"));
      valid = false;
    }

    if (!fields.terms.checked) {
      setError("terms", "Fogadd el a feltételeket.");
      valid = false;
    }

    if (!valid) return;

    if (successMsg) successMsg.hidden = false;
    form.reset();
  });
}