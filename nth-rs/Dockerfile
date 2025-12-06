FROM rust:1.91 AS builder

WORKDIR /usr/src/app

# Copy only dependency files first (for better caching)
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Now copy actual source code
COPY ./src ./src
COPY ./config ./config

# Build with actual source (dependencies are cached)
RUN touch src/main.rs && cargo build --release

# Use same base as builder to match GLIBC version
FROM rust:1.91-slim

WORKDIR /app

# Install runtime dependencies if needed
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy only the binary from builder
COPY --from=builder /usr/src/app/target/release/nth-rs .
COPY --from=builder /usr/src/app/config ./config

CMD ["./nth-rs"]