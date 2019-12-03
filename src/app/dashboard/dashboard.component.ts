import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  ProductService
} from '../product.service';
import {
  Subscription
} from 'rxjs';
import {
  HeaderDialogComponent
} from '../header/header.component';
import {
  MatDialog
} from '@angular/material';
import { LoginService } from '../login.service';
declare let alertify: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public containerHeight;
  public temp;
  public prodSubScrip: Subscription;
  public getProdSubscrip : Subscription;
  public roleSubscrip: Subscription;
  public products: any = [];
  public role;
  constructor(public prodServ: ProductService, public dialog: MatDialog, public loginservice: LoginService) {
   this.getProdSubscrip = this.prodServ.productsSub.subscribe(data => {
      this.products = data;
    })

   this.roleSubscrip = this.loginservice.roleListener.subscribe(data =>{
      this.role = data;
    });
  }

  ngOnInit() {
    this.temp = document.getElementsByTagName('body')[0];
    this.containerHeight = this.temp.offsetHeight - 64;
    this.prodSubScrip = this.prodServ.fetchProducts().subscribe(result => {
      this.products = result['data'];
    });
  }

  ngOnDestroy() {
    if (this.prodSubScrip) this.prodSubScrip.unsubscribe();
    if(this.roleSubscrip) this.roleSubscrip.unsubscribe();
    if(this.getProdSubscrip) this.getProdSubscrip.unsubscribe();
  }

  delete(product) {
    if (product) {
      this.prodServ.deleteProduct(product).subscribe(data => {
        alertify.success(data.message)
        this.prodServ.productsSub.next(data.products);
      })
    }
  }

  edit(product) {

    const dialogRef = this.dialog.open(HeaderDialogComponent, {
      width: '320px',
      height: '340px',
      data: {
        pName: product.productName,
        price: product.productPrice
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const data = {
          productName: result.pName,
          price: result.price,
          productId: product.productId,
          id: product._id
        };
        console.log(data)
        this.prodServ.editProduct(data).subscribe(data => {
          alertify.success(data.message);
          this.prodServ.productsSub.next(data.products);
        })
      }
    });
  }

}
