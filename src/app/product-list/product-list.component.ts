import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';

interface Product {
  id?: number;
  sku: string;
  name: string;
  price: number;
  images: string[];
  originalPrice?: number;
  discount?: number;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  selectedProduct: Product | null = null;
  imageFiles: File[] = [];
  showUpdatePopup: boolean = false;
  hoveredProduct: number | null = null;

  // Loading state variables
  isLoading: boolean = false;
  actionType: string = ''; // 'add', 'edit', 'delete'
  loadingMessage: string = 'Processing...';
  deletingProductId: number | null = null;

  // For file input display
  selectedFileNames: string = '';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      sku: [''],
      name: [''],
      price: [''],
      images: [[]],
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts() {
    this.http
      .get<Product[]>(
        'https://inovant-ecommerce-admin-panel-backend.onrender.com/api/products'
      )
      .subscribe((data) => (this.products = data));
  }

  addProduct() {
    if (this.productForm.invalid) return;

    this.isLoading = true;
    this.actionType = 'add';
    this.loadingMessage = 'Adding product...';

    const formData = new FormData();
    formData.append('sku', this.productForm.value.sku);
    formData.append('name', this.productForm.value.name);
    formData.append('price', this.productForm.value.price);

    // Append each image file
    this.imageFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.http
      .post(
        'https://inovant-ecommerce-admin-panel-backend.onrender.com/api/products',
        formData
      )
      .subscribe({
        next: () => {
          this.fetchProducts();
          this.closeUpdatePopup();
        },
        error: (error) => {
          console.error('Error adding product:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  editProduct(product: Product) {
    this.selectedProduct = product;
    this.productForm.patchValue({
      sku: product.sku,
      name: product.name,
      price: product.price,
    });
    this.imageFiles = []; // Clear previous files
    this.selectedFileNames = ''; // Clear file names
    this.showUpdatePopup = true;
  }

  updateProduct() {
    if (!this.selectedProduct?.id || this.productForm.invalid) return;

    this.isLoading = true;
    this.actionType = 'edit';
    this.loadingMessage = 'Updating product...';

    const formData = new FormData();
    formData.append('sku', this.productForm.value.sku);
    formData.append('name', this.productForm.value.name);
    formData.append('price', this.productForm.value.price);

    // Append each image file
    this.imageFiles.forEach((file) => {
      formData.append('images', file, file.name);
    });

    this.http
      .put(
        `https://inovant-ecommerce-admin-panel-backend.onrender.com/api/products/${this.selectedProduct.id}`,
        formData
      )
      .subscribe({
        next: () => {
          this.fetchProducts();
          this.closeUpdatePopup();
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading = true;
      this.actionType = 'delete';
      this.deletingProductId = id;
      this.loadingMessage = 'Deleting product...';

      this.http
        .delete(
          `https://inovant-ecommerce-admin-panel-backend.onrender.com/api/products/${id}`
        )
        .subscribe({
          next: () => {
            this.fetchProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.isLoading = false;
            this.deletingProductId = null;
          },
          complete: () => {
            this.isLoading = false;
            this.deletingProductId = null;
          },
        });
    }
  }

  deleteImage(imageUrl: string) {
    if (!this.selectedProduct?.id || this.isLoading) return;

    this.isLoading = true;
    this.actionType = 'edit';
    this.loadingMessage = 'Removing image...';

    this.http
      .put(
        `https://inovant-ecommerce-admin-panel-backend.onrender.com/api/products/${this.selectedProduct.id}`,
        {
          removeImages: [imageUrl],
        }
      )
      .subscribe({
        next: () => {
          if (this.selectedProduct) {
            this.selectedProduct.images = this.selectedProduct.images.filter(
              (img) => img !== imageUrl
            );
          }
        },
        error: (error) => {
          console.error('Error removing image:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  onImageChange(event: any) {
    this.imageFiles = Array.from(event.target.files);
    this.selectedFileNames = this.imageFiles.map((f) => f.name).join(', ');
  }

  closeUpdatePopup() {
    this.showUpdatePopup = false;
    this.selectedProduct = null;
    this.productForm.reset();
    this.imageFiles = [];
    this.selectedFileNames = '';
    this.isLoading = false;
  }
}
