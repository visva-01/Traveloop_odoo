fetch("http://localhost:8082/")
  .then(res => res.text())
  .then(text => {
    console.log(text.substring(0, 1000));
  });
