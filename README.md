# wx-ssss

> A zero-dependency, offline implementation of Shamir's Secret Sharing (SSS) designed for long-term digital preservation.

**Website:** [html-vault.com](https://html-vault.com/)

---

This project is a web-based tool to split sensitive text (passwords, seed phrases, private keys) into multiple parts using **Shamir's Secret Sharing**.

This project focuses on providing an implementation that is:

-   Practical and easy to use
-   Requires no dependencies (other than a browser)
-   Is future proof and resilient enough for real use

### Description

See [html-vault.com](https://html-vault.com/) for a full explanation.

## Recovery tool

In the very unlikely event where the self-contained combiner would fail or stop working (e.g. browser APIs have changed), the parts can be combined using an independent Python tool.

#### 1. Identify the part

Inspect each part file (e.g. `part3_dNnqL.html`) with a text editor and find the following snippet:

```js
const PART = "<hex>";
```

The `<hex>` is your part, collect all the necessary parts.

#### 2. Combine the parts

Run the following tool with as many parts as necessary:

```sh
python3 tools/combine.py <hex1> <hex2> ...
```

If the part was encrypted with a password, use this instead:

```sh
python3 ./tools/combine_with_secret.py -p <password> <hex1> <hex2> ...
```
