using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPSystem.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStockConvert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockConverts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VoucherNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Remarks = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockConverts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StockConvertDestinationLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StockConvertId = table.Column<int>(type: "int", nullable: false),
                    LineNo = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    WarehouseId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockConvertDestinationLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockConvertDestinationLines_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockConvertDestinationLines_StockConverts_StockConvertId",
                        column: x => x.StockConvertId,
                        principalTable: "StockConverts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockConvertDestinationLines_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StockConvertSourceLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StockConvertId = table.Column<int>(type: "int", nullable: false),
                    LineNo = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    WarehouseId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockConvertSourceLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockConvertSourceLines_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockConvertSourceLines_StockConverts_StockConvertId",
                        column: x => x.StockConvertId,
                        principalTable: "StockConverts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockConvertSourceLines_Warehouses_WarehouseId",
                        column: x => x.WarehouseId,
                        principalTable: "Warehouses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertDestinationLines_ProductId",
                table: "StockConvertDestinationLines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertDestinationLines_StockConvertId",
                table: "StockConvertDestinationLines",
                column: "StockConvertId");

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertDestinationLines_WarehouseId",
                table: "StockConvertDestinationLines",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertSourceLines_ProductId",
                table: "StockConvertSourceLines",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertSourceLines_StockConvertId",
                table: "StockConvertSourceLines",
                column: "StockConvertId");

            migrationBuilder.CreateIndex(
                name: "IX_StockConvertSourceLines_WarehouseId",
                table: "StockConvertSourceLines",
                column: "WarehouseId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StockConvertDestinationLines");

            migrationBuilder.DropTable(
                name: "StockConvertSourceLines");

            migrationBuilder.DropTable(
                name: "StockConverts");
        }
    }
}
